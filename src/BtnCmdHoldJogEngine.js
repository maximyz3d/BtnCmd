export default class BtnCmdHoldJogEngine {
    constructor() {
        this.activeJogs = new Map();
        this.defaultSegment = 0.1;
        this.defaultFeedrate = 120;
        this.defaultPollIntervalMs = 35;
    }

    startHold(btn, globalSettings, sendCodeFn, getAxisPosInchesFn) {
        if (!btn || !btn.btnID || this.activeJogs.has(btn.btnID)) {
            return;
        }
        const segSetting = Number(globalSettings?.jogSegmentInches);
        const feedSetting = Number(globalSettings?.jogFeedrateIPM);
        const segIn = Math.abs(segSetting) || this.defaultSegment;
        const feedIpm = Math.abs(feedSetting) || this.defaultFeedrate;
        if (!segIn || !feedIpm || !btn.btnJogAxis || !btn.btnJogDir || typeof sendCodeFn !== 'function') {
            return;
        }

        const axisLetter = btn.btnJogAxis.toUpperCase();
        const dirSign = btn.btnJogDir === '-' ? -1 : 1;
        let basePos = typeof getAxisPosInchesFn === 'function' ? getAxisPosInchesFn(axisLetter) : null;
        if (basePos === undefined || basePos === null || Number.isNaN(basePos)) {
            console.warn(`[BtnCmdHoldJogEngine] Axis position unavailable for ${axisLetter}, defaulting to 0.`);
            basePos = 0;
        }

        const command = `G20\nG91\nG1 ${axisLetter}${dirSign * segIn} F${feedIpm}\nG90`;
        const pollIntervalMs = this.defaultPollIntervalMs;

        const state = {
            active: true,
            btnID: btn.btnID,
            axisLetter,
            dirSign,
            segIn,
            feedIpm,
            bufferMaxIn: 0.5,
            sentTargetPos: basePos,
            inFlight: 0,
            maxInFlight: 1,
            pollTimer: null,
            sendCodeFn,
            getAxisPosInchesFn,
            command,
            pollIntervalMs,
        };

        this.activeJogs.set(btn.btnID, state);
        this.attemptRefill(btn.btnID);
        state.pollTimer = setInterval(() => this.attemptRefill(btn.btnID), pollIntervalMs);
    }

    stopHold(btnID) {
        const state = this.activeJogs.get(btnID);
        if (state) {
            state.active = false;
            if (state.pollTimer) {
                clearInterval(state.pollTimer);
            }
        }
        this.activeJogs.delete(btnID);
    }

    stopAll() {
        Array.from(this.activeJogs.keys()).forEach((btnID) => this.stopHold(btnID));
    }

    isActive(btnID) {
        return this.activeJogs.has(btnID);
    }

    attemptRefill(btnID) {
        const state = this.activeJogs.get(btnID);
        if (!state || !state.active) {
            return;
        }

        const segTimeMs = (state.segIn / (state.feedIpm / 60)) * 1000;
        state.bufferMaxIn = state.pollIntervalMs > segTimeMs * 0.8 ? 1.0 : 0.5;
        state.maxInFlight = segTimeMs < state.pollIntervalMs ? 2 : 1;

        const currentPos = typeof state.getAxisPosInchesFn === 'function'
            ? state.getAxisPosInchesFn(state.axisLetter)
            : null;

        if (currentPos === undefined || currentPos === null || Number.isNaN(currentPos)) {
            if (state.inFlight < state.maxInFlight) {
                this.sendOneSegment(btnID);
                state.sentTargetPos += state.dirSign * state.segIn;
            }
            return;
        }

        let bufferedAhead = state.dirSign * (state.sentTargetPos - currentPos);

        while (bufferedAhead < state.bufferMaxIn && state.inFlight < state.maxInFlight) {
            this.sendOneSegment(btnID);
            state.sentTargetPos += state.dirSign * state.segIn;
            bufferedAhead = state.dirSign * (state.sentTargetPos - currentPos);
        }
    }

    sendOneSegment(btnID) {
        const state = this.activeJogs.get(btnID);
        if (!state || !state.active) {
            return;
        }

        state.inFlight += 1;
        Promise.resolve(state.sendCodeFn(state.command)).finally(() => {
            const currentState = this.activeJogs.get(btnID);
            if (!currentState) {
                return;
            }
            currentState.inFlight = Math.max(0, currentState.inFlight - 1);
            if (currentState.active) {
                this.attemptRefill(btnID);
            }
        });
    }
}
