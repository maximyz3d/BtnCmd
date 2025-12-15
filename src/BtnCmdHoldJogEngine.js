export default class BtnCmdHoldJogEngine {
    constructor() {
        this.activeAxes = new Map();
        this.btnAxisMap = new Map();
        this.defaultSegment = 0.1;
        this.defaultFeedrate = 120;
        this.defaultPollIntervalMs = 35;
        this.pollTimer = null;
        this.sendCodeFn = null;
        this.getAxisPosInchesFn = null;
        this.segIn = this.defaultSegment;
        this.feedIpm = this.defaultFeedrate;
        this.bufferMaxIn = 0.5;
        this.inFlight = 0;
        this.maxInFlight = 1;
        this.controlSource = null;
    }

    startHold(btn, globalSettings, sendCodeFn, getAxisPosInchesFn, source = 'unknown') {
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
        const feedSetting = Number(globalSettings?.jogFeedrateIPM);
        const segIn = Math.abs(segSetting) || this.defaultSegment;
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
        this.feedIpm = feedIpm;
        this.sendCodeFn = sendCodeFn;
        this.getAxisPosInchesFn = getAxisPosInchesFn;
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

        const segIn = this.segIn || this.defaultSegment;
        const feedIpm = this.feedIpm || this.defaultFeedrate;
        const segTimeMs = (segIn / (feedIpm / 60)) * 1000;
        this.bufferMaxIn = this.defaultPollIntervalMs > segTimeMs * 0.8 ? 1.0 : 0.5;
        this.maxInFlight = segTimeMs < this.defaultPollIntervalMs ? 2 : 1;

        const axisStates = Array.from(this.activeAxes.values());
        const bufferedAheadValues = [];
        let validCount = 0;

        axisStates.forEach((axisState) => {
            const currentPos = typeof this.getAxisPosInchesFn === 'function'
                ? this.getAxisPosInchesFn(axisState.axisLetter)
                : null;

            if (currentPos === undefined || currentPos === null || Number.isNaN(currentPos)) {
                return;
            }
            validCount += 1;
            bufferedAheadValues.push(axisState.dirSign * (axisState.sentTargetPos - currentPos));
        });

        if (validCount === 0) {
            if (this.inFlight < this.maxInFlight) {
                this.sendCombinedSegment(axisStates, segIn, feedIpm);
                axisStates.forEach((axisState) => {
                    axisState.sentTargetPos += axisState.dirSign * segIn;
                });
            }
            return;
        }

        if (validCount !== axisStates.length) {
            return;
        }

        let minBufferedAhead = Math.min(...bufferedAheadValues);
        while (minBufferedAhead < this.bufferMaxIn && this.inFlight < this.maxInFlight) {
            this.sendCombinedSegment(axisStates, segIn, feedIpm);
            axisStates.forEach((axisState) => {
                axisState.sentTargetPos += axisState.dirSign * segIn;
            });
            bufferedAheadValues.forEach((_, idx) => {
                bufferedAheadValues[idx] += segIn;
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
    }
}
