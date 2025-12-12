export default class BtnCmdHoldJogEngine {
    constructor() {
        this.activeJogs = new Map();
    }

    start(btn, globalSettings, sendCodeFn) {
        if (!btn || !btn.btnID || this.activeJogs.has(btn.btnID)) {
            return;
        }
        const seg = Number(globalSettings?.jogSegmentInches) || 0;
        const feed = Number(globalSettings?.jogFeedrateIPM) || 0;
        if (!seg || !feed || !btn.btnJogAxis || !btn.btnJogDir) {
            return;
        }

        const distance = (btn.btnJogDir === '-') ? -Math.abs(seg) : Math.abs(seg);
        const axis = btn.btnJogAxis.toUpperCase();
        const command = `G20\nG91\nG1 ${axis}${distance} F${feed}\nG90`;
        const segmentTimeMs = Math.max((Math.abs(seg) / (feed / 60)) * 1000, 10);
        const sendOffset = segmentTimeMs * 0.8;

        const state = {
            cmd: command,
            timer: null,
            lastSend: 0,
            interval: segmentTimeMs,
            sendOffset,
            sendCodeFn,
        };

        this.activeJogs.set(btn.btnID, state);
        this._sendAndSchedule(btn.btnID);
    }

    stop(btnID) {
        const state = this.activeJogs.get(btnID);
        if (state?.timer) {
            clearTimeout(state.timer);
        }
        this.activeJogs.delete(btnID);
    }

    isActive(btnID) {
        return this.activeJogs.has(btnID);
    }

    _sendAndSchedule(btnID) {
        const state = this.activeJogs.get(btnID);
        if (!state) {
            return;
        }
        state.lastSend = Date.now();
        state.sendCodeFn(state.cmd);

        const scheduleNext = () => {
            const activeState = this.activeJogs.get(btnID);
            if (!activeState) {
                return;
            }
            const now = Date.now();
            const elapsed = now - activeState.lastSend;
            let delay = activeState.sendOffset - elapsed;
            if (elapsed > activeState.interval) {
                delay = 0;
            }
            activeState.timer = setTimeout(() => this._sendAndSchedule(btnID), Math.max(0, delay));
        };

        scheduleNext();
    }
}
