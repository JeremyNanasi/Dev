/**
 * @fileoverview
 * Provides a small sound facade for persisting the sound preference and applying it to the background music element.
 *
 * Exposes helper functions and a simple UI toggle controller while keeping a shared singleton state on `window`.
 */

{
let root = window.EPL || (window.EPL = {});
root.Controllers = root.Controllers || {};
let state = window.__epl_sound_facade_state || (window.__epl_sound_facade_state = { initialized: false });
/**
 * Returns the key.
 * This helper centralizes read access for callers.
 * @returns {string} Returns the resulting string value.
 */
function eplSoundFacadeGetKey() {
    let keys = root.KEYS || {};
    return keys.SOUND_ENABLED || 'sound-enabled';
}

/**
 * Returns the audio.
 * This helper centralizes read access for callers.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplSoundFacadeGetAudio() {
    return document.getElementById('background-music');
}

/**
 * Evaluates the enabled condition.
 * Returns whether the current runtime state satisfies that condition.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function eplSoundFacadeIsEnabled() {
    let api = root.Sound;
    let fn = api && api.isEnabled;
    if (typeof fn === 'function' && fn !== eplSoundFacadeIsEnabled) return fn.call(api);
    return localStorage.getItem(eplSoundFacadeGetKey()) !== 'false';
}

/**
 * Applies state.
 * The operation is isolated here to keep behavior predictable.
 * @param {boolean} enabled - Boolean flag controlling this branch.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
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

/**
 * Sets the enabled.
 * This keeps persistent and in-memory state aligned.
 * @param {boolean} enabled - Boolean flag controlling this branch.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplSoundFacadeSetEnabled(enabled) {
    let value = !!enabled;
    let api = root.Sound;
    let fn = api && api.setEnabled;
    localStorage.setItem(eplSoundFacadeGetKey(), value ? 'true' : 'false');
    if (typeof fn === 'function' && fn !== eplSoundFacadeSetEnabled) return fn.call(api, value);
    return eplSoundFacadeApplyState(value);
}

/**
 * Toggles routine.
 * The operation is isolated here to keep behavior predictable.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplSoundFacadeToggle() {
    let next = !eplSoundFacadeIsEnabled();
    eplSoundFacadeSetEnabled(next);
    return next;
}

/**
 * Plays on gesture.
 * The operation is isolated here to keep behavior predictable.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplSoundFacadeTryPlayOnGesture() {
    let api = root.Sound;
    let fn = api && api.tryPlayOnGesture;
    let audio = eplSoundFacadeGetAudio();
    if (typeof fn === 'function' && fn !== eplSoundFacadeTryPlayOnGesture) return fn.call(api);
    if (!eplSoundFacadeIsEnabled() || !audio || !audio.paused) return;
    audio.currentTime = 0;
    audio.play().catch(function() {});
}

/**
 * Initializes routine.
 * It is part of the module startup flow.
 * @returns {unknown} Returns the value produced by this routine.
 */
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

/**
 * Toggles controller.
 * The operation is isolated here to keep behavior predictable.
 * @param {object} deps - Object argument used by this routine.
 */
function SoundToggleController(deps) {
    this.deps = deps;
    this.button = null;
    this.icon = null;
}

/**
 * Initializes routine.
 * It is part of the module startup flow.
 */
SoundToggleController.prototype.init = function () {
    this.button = document.getElementById('mute-toggle');
    this.icon = document.getElementById('mute-icon');
    if (!this.button || !this.icon) return;
    this.attachListener();
    this.updateIcon(this.deps.soundManager.isEnabled());
};

/**
 * Attaches listener.
 * The operation is isolated here to keep behavior predictable.
 */
SoundToggleController.prototype.attachListener = function () {
    const self = this;
    this.button.addEventListener('click', function () {
        const next = self.deps.soundManager.toggle();
        self.updateIcon(next);
    });
};

/**
 * Updates icon.
 * This synchronizes runtime state with current inputs.
 * @param {boolean} enabled - Boolean flag controlling this branch.
 */
SoundToggleController.prototype.updateIcon = function (enabled) {
    if (this.icon) {
        this.icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
        this.icon.alt = enabled ? 'Sound an' : 'Sound aus';
    }
    if (this.button) {
        this.button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    }
};
if (!window.EPL.Controllers.SoundToggle) {
    window.EPL.Controllers.SoundToggle = SoundToggleController;
}
if (!root.Sound) root.Sound = {};
if (!root.Sound.init) root.Sound.init = eplSoundFacadeInit;
if (!root.Sound.isEnabled) root.Sound.isEnabled = eplSoundFacadeIsEnabled;
if (!root.Sound.setEnabled) root.Sound.setEnabled = eplSoundFacadeSetEnabled;
if (!root.Sound.toggle) root.Sound.toggle = eplSoundFacadeToggle;
if (!root.Sound.applyState) root.Sound.applyState = eplSoundFacadeApplyState;
if (!root.Sound.tryPlayOnGesture) root.Sound.tryPlayOnGesture = eplSoundFacadeTryPlayOnGesture;
if (!root.Sound.getAudio) root.Sound.getAudio = eplSoundFacadeGetAudio;
}
