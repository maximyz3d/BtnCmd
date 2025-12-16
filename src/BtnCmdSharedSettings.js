import Vue from 'vue';

const defaultGlobals = Vue.observable({
    enableKeyboardJog: false,
    enableKeyboardControl: false,
    jogFeedrateIPM: null,
});

const sharedState = Vue.observable({
    global: defaultGlobals
});

function coerceKeyboardValue(val) {
    return !!val;
}

function ensureKeyboardFields(settings) {
    if (!settings) {
        return;
    }
    const hasJog = Object.prototype.hasOwnProperty.call(settings, 'enableKeyboardJog');
    const hasControl = Object.prototype.hasOwnProperty.call(settings, 'enableKeyboardControl');
    if (!hasJog && hasControl) {
        settings.enableKeyboardJog = coerceKeyboardValue(settings.enableKeyboardControl);
    }
    if (!hasControl && hasJog) {
        settings.enableKeyboardControl = coerceKeyboardValue(settings.enableKeyboardJog);
    }
    if (!hasJog && !hasControl) {
        settings.enableKeyboardJog = false;
        settings.enableKeyboardControl = false;
    }
}

function setGlobalSettingsRef(globalSettings) {
    if (globalSettings) {
        ensureKeyboardFields(globalSettings);
        sharedState.global = globalSettings;
    } else {
        sharedState.global = defaultGlobals;
    }
}

function getEnableKeyboardJog() {
    const gs = sharedState.global;
    if (!gs) {
        return false;
    }
    if (typeof gs.enableKeyboardJog !== 'undefined') {
        return !!gs.enableKeyboardJog;
    }
    return !!gs.enableKeyboardControl;
}

function setEnableKeyboardJog(val) {
    if (!sharedState.global) {
        return;
    }
    const coerced = coerceKeyboardValue(val);
    sharedState.global.enableKeyboardJog = coerced;
    sharedState.global.enableKeyboardControl = coerced;
}

function getJogFeedrateIPM() {
    const gs = sharedState.global;
    if (!gs) {
        return null;
    }
    return gs.jogFeedrateIPM;
}

function setJogFeedrateIPM(val) {
    if (!sharedState.global) {
        return;
    }
    sharedState.global.jogFeedrateIPM = val;
}

export default {
    global: sharedState.global,
    state: sharedState,
    setGlobalSettingsRef,
    getEnableKeyboardJog,
    setEnableKeyboardJog,
    getJogFeedrateIPM,
    setJogFeedrateIPM,
};
