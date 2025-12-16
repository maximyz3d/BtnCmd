export default class BtnCmdHoldJogEngine {
    constructor() {
        this.activeAxes = new Map();
        this.btnAxisMap = new Map();
        this.defaultSegment = 0.1;
        this.defaultSegmentScale = 1.0;
        this.defaultMinSegment = 0.1;
        this.defaultMaxSegment = 6.0;
        this.defaultFeedrate = 120;
        this.defaultPollIntervalMs = 35;
        this.pollTimer = null;
        this.sendCodeFn = null;
        this.getAxisPosInchesFn = null;
        this.getAxisAccelMmFn = null;
        this.segIn = this.defaultSegment;
        this.segScale = this.defaultSegmentScale;
        this.minSegIn = this.defaultMinSegment;
        this.maxSegIn = this.defaultMaxSegment;
        this.feedIpm = this.defaultFeedrate;
        this.bufferMaxIn = 0.5;
        this.inFlight = 0;
        this.maxInFlight = 1;
        this.controlSource = null;
        this.missingAccelWarned = new Set();
        this.debugRefillCount = 0;
    }

    startHold(btn, globalSettings, sendCodeFn, getAxisPosInchesFn, getAxisAccelMmFn, source = 'unknown') {
        if (!btn || !btn.btnID) {
            return false;
        }
        const sourceTag = source || 'unknown';
        if (this.controlSource && this.controlSource !== sourceTag) {
            return false;
        }
        if (this.btnAxisMap.has(btn.btnID)) {
            return true;
        }
        const segSetting = Number(globalSettings?.jogSegmentInches);
        const segScaleSetting = Number(globalSettings?.jogSegmentScale);
        const minSegSetting = Number(globalSettings?.jogMinSegmentInches);
        const maxSegSetting = Number(globalSettings?.jogMaxSegmentInches);
        const feedSetting = Number(globalSettings?.jogFeedrateIPM);
        const segIn = Math.abs(segSetting) || this.defaultSegment;
        const segScale = Math.abs(segScaleSetting) || this.defaultSegmentScale;
        const minSegIn = Math.abs(minSegSetting) || this.defaultMinSegment;
        const maxSegIn = Math.abs(maxSegSetting) || this.defaultMaxSegment;
        const feedIpm = Math.abs(feedSetting) || this.defaultFeedrate;
        if (!segIn || !feedIpm || !btn.btnJogAxis || !btn.btnJogDir || typeof sendCodeFn !== 'function') {
            return false;
        }

        const axisLetter = btn.btnJogAxis.toUpperCase();
        const dirSign = btn.btnJogDir === '-' ? -1 : 1;

        if (['Z', 'A'].includes(axisLetter) && this.activeAxes.size > 0) {
            return false;
        }
        const hasRestricted = Array.from(this.activeAxes.keys()).some((ax) => ['Z', 'A'].includes(ax));
        if (hasRestricted && !['Z', 'A'].includes(axisLetter)) {
            return false;
        }
        const nonPlanar = Array.from(this.activeAxes.keys()).some((ax) => !['X', 'Y'].includes(ax));
        if (['X', 'Y'].includes(axisLetter) && nonPlanar) {
            return false;
        }
        const existingAxis = this.activeAxes.get(axisLetter);
        if (existingAxis) {
            if (existingAxis.dirSign !== dirSign) {
                return false;
            }
            return true;
        }

        let basePos = typeof getAxisPosInchesFn === 'function' ? getAxisPosInchesFn(axisLetter) : null;
        if (basePos === undefined || basePos === null || Number.isNaN(basePos)) {
            console.warn(`[BtnCmdHoldJogEngine] Axis position unavailable for ${axisLetter}, defaulting to 0.`);
            basePos = 0;
        }

        this.segIn = segIn;
        this.segScale = segScale;
        this.minSegIn = minSegIn;
        this.maxSegIn = Math.max(this.minSegIn, maxSegIn);
        this.feedIpm = feedIpm;
        this.sendCodeFn = sendCodeFn;
        this.getAxisPosInchesFn = getAxisPosInchesFn;
        this.getAxisAccelMmFn = getAxisAccelMmFn;
        if (!this.controlSource) {
            this.controlSource = sourceTag;
        }

        this.activeAxes.set(axisLetter, {
            btnID: btn.btnID,
            axisLetter,
            dirSign,
            sentTargetPos: basePos,
        });
        this.btnAxisMap.set(btn.btnID, axisLetter);
        if (!this.pollTimer) {
            this.pollTimer = setInterval(() => this.attemptRefillAll(), this.defaultPollIntervalMs);
        }
        this.attemptRefillAll();
        return true;
    }

    stopHold(btnID) {
        const axisLetter = this.btnAxisMap.get(btnID);
        if (!axisLetter) {
            return;
        }
        this.activeAxes.delete(axisLetter);
        this.btnAxisMap.delete(btnID);
        if (this.activeAxes.size === 0) {
            this.cleanupTimers();
        }
    }

    stopAll() {
        this.activeAxes.clear();
        this.btnAxisMap.clear();
        this.cleanupTimers();
    }

    isActive(btnID) {
        return this.btnAxisMap.has(btnID);
    }

    attemptRefillAll() {
        if (this.activeAxes.size === 0 || !this.sendCodeFn) {
            return;
        }

        const axisStates = Array.from(this.activeAxes.values());
        const axisLetters = axisStates.map((axisState) => axisState.axisLetter);
        const feedIpm = this.feedIpm || this.defaultFeedrate;
        const segInDynamic = this.computeDynamicSegIn(feedIpm, axisLetters, this.segIn || this.defaultSegment);
        const segTimeMs = (segInDynamic / (feedIpm / 60)) * 1000;
        this.bufferMaxIn = this.defaultPollIntervalMs > segTimeMs * 0.8 ? 1.0 : 0.5;
        this.maxInFlight = segTimeMs < this.defaultPollIntervalMs ? 2 : 1;

        const bufferedAheadValues = [];
        let validCount = 0;
        let backlogExceeded = false;
        const logAllowed = this.debugRefillCount < 10;
        const debugRows = [];

        axisStates.forEach((axisState) => {
            const currentPos = typeof this.getAxisPosInchesFn === 'function'
                ? this.getAxisPosInchesFn(axisState.axisLetter)
                : null;
            const accelMm = typeof this.getAxisAccelMmFn === 'function'
                ? this.getAxisAccelMmFn(axisState.axisLetter)
                : null;

            if (currentPos === undefined || currentPos === null || Number.isNaN(currentPos)) {
                return;
            }
            validCount += 1;
            bufferedAheadValues.push(axisState.dirSign * (axisState.sentTargetPos - currentPos));
            const backlogDistanceIn = Math.abs(axisState.sentTargetPos - currentPos);
            if (backlogDistanceIn > 2 * segInDynamic) {
                backlogExceeded = true;
            }
            if (logAllowed) {
                debugRows.push({
                    axisLetter: axisState.axisLetter,
                    currentPos,
                    sentTargetPos: axisState.sentTargetPos,
                    segInDynamic,
                    accelMm,
                    backlogExceeded: false,
                });
            }
        });

        if (validCount === 0) {
            if (this.inFlight < this.maxInFlight) {
                this.sendCombinedSegment(axisStates, segInDynamic, feedIpm);
                axisStates.forEach((axisState) => {
                    axisState.sentTargetPos += axisState.dirSign * segInDynamic;
                });
            }
            return;
        }

        if (validCount !== axisStates.length) {
            return;
        }

        if (backlogExceeded) {
            if (logAllowed) {
                debugRows.forEach((row) => {
                    row.backlogExceeded = true;
                    console.debug('[BtnCmdHoldJogEngine] refill', row);
                });
                this.debugRefillCount += 1;
            }
            return;
        }

        if (logAllowed && debugRows.length > 0) {
            debugRows.forEach((row) => {
                row.backlogExceeded = false;
                console.debug('[BtnCmdHoldJogEngine] refill', row);
            });
            this.debugRefillCount += 1;
        }

        let minBufferedAhead = Math.min(...bufferedAheadValues);
        while (minBufferedAhead < this.bufferMaxIn && this.inFlight < this.maxInFlight) {
            this.sendCombinedSegment(axisStates, segInDynamic, feedIpm);
            axisStates.forEach((axisState) => {
                axisState.sentTargetPos += axisState.dirSign * segInDynamic;
            });
            bufferedAheadValues.forEach((_, idx) => {
                bufferedAheadValues[idx] += segInDynamic;
            });
            minBufferedAhead = Math.min(...bufferedAheadValues);
        }
    }

    sendCombinedSegment(axisStates, segIn, feedIpm) {
        if (!Array.isArray(axisStates) || axisStates.length === 0) {
            return;
        }
        const axisMoves = axisStates.map((axisState) => `${axisState.axisLetter}${axisState.dirSign * segIn}`);
        const command = `G20\nG91\nG1 ${axisMoves.join(' ')} F${feedIpm}\nG90`;
        this.inFlight += 1;
        Promise.resolve(this.sendCodeFn(command)).finally(() => {
            this.inFlight = Math.max(0, this.inFlight - 1);
            if (this.activeAxes.size > 0) {
                this.attemptRefillAll();
            }
        });
    }

    cleanupTimers() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.inFlight = 0;
        this.controlSource = null;
        this.missingAccelWarned.clear();
        this.debugRefillCount = 0;
    }

    computeDynamicSegIn(feedIpm, axisLettersInMove, fallbackSegIn) {
        const axisLetters = Array.isArray(axisLettersInMove) ? axisLettersInMove : [];
        let limitingAccelIn = null;
        axisLetters.forEach((letter) => {
            const accelMm = typeof this.getAxisAccelMmFn === 'function' ? this.getAxisAccelMmFn(letter) : null;
            const accelIn = accelMm && Number.isFinite(accelMm) ? accelMm / 25.4 : null;
            if (!accelIn || accelIn <= 0) {
                if (!this.missingAccelWarned.has(letter)) {
                    console.warn(`[BtnCmdHoldJogEngine] Missing or invalid acceleration for axis ${letter}; using fixed segment.`);
                    this.missingAccelWarned.add(letter);
                }
                return;
            }
            if (limitingAccelIn === null || accelIn < limitingAccelIn) {
                limitingAccelIn = accelIn;
            }
        });

        const fallback = Math.abs(fallbackSegIn) || this.defaultSegment;
        if (limitingAccelIn === null) {
            return this.clamp(fallback, this.minSegIn, this.maxSegIn);
        }

        const vIn = Math.abs(feedIpm) / 60;
        const dAccel = (vIn * vIn) / (2 * limitingAccelIn || 1);
        const scaled = this.segScale * dAccel;
        return this.clamp(scaled, this.minSegIn, this.maxSegIn);
    }

    clamp(value, min, max) {
        const safeMin = Number.isFinite(min) ? min : this.defaultMinSegment;
        const safeMax = Number.isFinite(max) ? max : this.defaultMaxSegment;
        return Math.min(Math.max(value, safeMin), safeMax);
    }
}
