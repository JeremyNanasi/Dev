let root = window.EPL || (window.EPL = {});
root.Controllers = root.Controllers || {};
let state = window.__epl_sound_facade_state || (window.__epl_sound_facade_state = { initialized: false });

/** Return the persisted sound setting key. @returns {string} */
function eplSoundFacadeGetKey() {
    let keys = root.KEYS || {};
    return keys.SOUND_ENABLED || 'sound-enabled';
}

/** Return the background music element. @returns {HTMLAudioElement|null} */
function eplSoundFacadeGetAudio() {
    return document.getElementById('background-music');
}

/** Return whether sound is enabled. @returns {boolean} */
function eplSoundFacadeIsEnabled() {
    let api = root.Sound;
    let fn = api && api.isEnabled;
    if (typeof fn === 'function' && fn !== eplSoundFacadeIsEnabled) return fn.call(api);
    return localStorage.getItem(eplSoundFacadeGetKey()) !== 'false';
}

/** Apply audio state for the selected enabled flag. @param {boolean} enabled @returns {boolean} */
function eplSoundFacadeApplyState(enabled) {
    let api = root.Sound;
    let fn = api && api.applyState;
    let audio = eplSoundFacadeGetAudio();
    if (typeof fn === 'function' && fn !== eplSoundFacadeApplyState) return fn.call(api, !!enabled);
    fn = api && api.apply;
    if (typeof fn === 'function' && fn !== eplSoundFacadeApplyState) return fn.call(api, !!enabled);
    if (!audio) return !!enabled;
    if (enabled) { audio.muted = false; audio.currentTime = 0; audio.play().catch(function() {}); return true; }
    audio.pause(); audio.currentTime = 0; audio.muted = true; return false;
}

/** Persist and apply the sound enabled flag. @param {boolean} enabled @returns {boolean} */
function eplSoundFacadeSetEnabled(enabled) {
    let value = !!enabled;
    let api = root.Sound;
    let fn = api && api.setEnabled;
    localStorage.setItem(eplSoundFacadeGetKey(), value ? 'true' : 'false');
    if (typeof fn === 'function' && fn !== eplSoundFacadeSetEnabled) return fn.call(api, value);
    return eplSoundFacadeApplyState(value);
}

/** Toggle sound state and return the new value. @returns {boolean} */
function eplSoundFacadeToggle() {
    let next = !eplSoundFacadeIsEnabled();
    eplSoundFacadeSetEnabled(next);
    return next;
}

/** Try to start playback after a user gesture. */
function eplSoundFacadeTryPlayOnGesture() {
    let api = root.Sound;
    let fn = api && api.tryPlayOnGesture;
    let audio = eplSoundFacadeGetAudio();
    if (typeof fn === 'function' && fn !== eplSoundFacadeTryPlayOnGesture) return fn.call(api);
    if (!eplSoundFacadeIsEnabled() || !audio || !audio.paused) return;
    audio.currentTime = 0;
    audio.play().catch(function() {});
}

/** Initialize the facade once. */
function eplSoundFacadeInit() {
    let api = root.Sound;
    let fn = api && api.init;
    let audio = eplSoundFacadeGetAudio();
    let enabled;
    if (state.initialized) return;
    state.initialized = true;
    if (typeof fn === 'function' && fn !== eplSoundFacadeInit) return fn.call(api);
    if (!audio) return;
    enabled = eplSoundFacadeIsEnabled();
    audio.removeAttribute('autoplay');
    audio.muted = !enabled;
    if (!enabled) { audio.pause(); audio.currentTime = 0; }
}

if (!root.Sound) root.Sound = {};
if (!root.Sound.init) root.Sound.init = eplSoundFacadeInit;
if (!root.Sound.isEnabled) root.Sound.isEnabled = eplSoundFacadeIsEnabled;
if (!root.Sound.setEnabled) root.Sound.setEnabled = eplSoundFacadeSetEnabled;
if (!root.Sound.toggle) root.Sound.toggle = eplSoundFacadeToggle;
if (!root.Sound.applyState) root.Sound.applyState = eplSoundFacadeApplyState;
if (!root.Sound.tryPlayOnGesture) root.Sound.tryPlayOnGesture = eplSoundFacadeTryPlayOnGesture;
if (!root.Sound.getAudio) root.Sound.getAudio = eplSoundFacadeGetAudio;
