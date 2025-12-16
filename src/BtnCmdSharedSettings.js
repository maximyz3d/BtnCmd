import Vue from 'vue';

const defaultGlobals = Vue.observable({
    enableKeyboardJog: false,
    enableKeyboardControl: false,
    jogFeedrateIPM: null,
});

const sharedState = Vue.observable({
    global: defaultGlobals,
    sourceRef: null
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
    const target = sharedState.global || Vue.observable({});
    if (globalSettings) {
        ensureKeyboardFields(globalSettings);
        sharedState.sourceRef = globalSettings;
        Object.keys(globalSettings).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(target, key)) {
                Vue.set(target, key, globalSettings[key]);
            } else {
                target[key] = globalSettings[key];
            }
        });
    } else {
        sharedState.sourceRef = null;
        Object.keys(target).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(defaultGlobals, key)) {
                target[key] = defaultGlobals[key];
            }
        });
    }
    sharedState.global = target;
}

function getGlobal() {
    return sharedState.global || defaultGlobals;
}

function getEnableKeyboardJog() {
    const gs = getGlobal();
    if (!gs) {
        return false;
    }
    if (typeof gs.enableKeyboardJog !== 'undefined') {
        return !!gs.enableKeyboardJog;
    }
    return !!gs.enableKeyboardControl;
}

function setEnableKeyboardJog(val) {
    const gs = getGlobal();
    const coerced = coerceKeyboardValue(val);
    gs.enableKeyboardJog = coerced;
    gs.enableKeyboardControl = coerced;
    if (sharedState.sourceRef && sharedState.sourceRef !== gs) {
        sharedState.sourceRef.enableKeyboardJog = coerced;
        sharedState.sourceRef.enableKeyboardControl = coerced;
    }
}

function getJogFeedrateIPM() {
    const gs = getGlobal();
    if (!gs) {
        return null;
    }
    return gs.jogFeedrateIPM;
}

function setJogFeedrateIPM(val) {
    const gs = getGlobal();
    if (!gs) {
        return;
    }
    gs.jogFeedrateIPM = val;
    if (sharedState.sourceRef && sharedState.sourceRef !== gs) {
        sharedState.sourceRef.jogFeedrateIPM = val;
    }
}

export default {
    state: sharedState,
    getGlobal,
    setGlobalSettingsRef,
    getEnableKeyboardJog,
    setEnableKeyboardJog,
    getJogFeedrateIPM,
    setJogFeedrateIPM,
};
