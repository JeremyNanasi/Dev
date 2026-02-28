/**
 * @fileoverview
 * Menu page runtime logic: binds UI controls, persists preferences (sound/touch/orientation), and triggers game start.
 *
 * Uses a shared window-backed state object to prevent duplicate event bindings.
 */
let state = window.__epl_menu_state || (window.__epl_menu_state = {
    domBound: false,
    booted: false,
    soundBound: false,
    controlsBound: false,
    gestureBound: false,
    startBound: false
});
/**
 * Returns the sound api.
 * This helper centralizes read access for callers.
 * @returns {unknown|null} Returns the value computed for the active runtime branch.
 */
function eplMenuGetSoundApi() {
    return window.EPL && window.EPL.Sound ? window.EPL.Sound : null;
}

/**
 * Returns the sound key.
 * This helper centralizes read access for callers.
 * @returns {string} Returns the resulting string value.
 */
function eplMenuGetSoundKey() {
    let keys = window.EPL && window.EPL.KEYS ? window.EPL.KEYS : {};
    return keys.SOUND_ENABLED || 'sound-enabled';
}

/**
 * Evaluates the sound enabled condition.
 * Returns whether the current runtime state satisfies that condition.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function eplMenuIsSoundEnabled() {
    let api = eplMenuGetSoundApi();
    if (api && typeof api.isEnabled === 'function') return api.isEnabled();
    return localStorage.getItem(eplMenuGetSoundKey()) !== 'false';
}

/**
 * Returns the audio.
 * This helper centralizes read access for callers.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplMenuGetAudio() {
    let api = eplMenuGetSoundApi();
    if (api && typeof api.getAudio === 'function') return api.getAudio();
    return document.getElementById('background-music');
}

/**
 * Applies sound state.
 * The operation is isolated here to keep behavior predictable.
 * @param {boolean} enabled - Boolean flag controlling this branch.
 */
function eplMenuApplySoundState(enabled) {
    let api = eplMenuGetSoundApi();
    let audio = eplMenuGetAudio();
    if (api && typeof api.applyState === 'function') api.applyState(!!enabled);
    else if (api && typeof api.apply === 'function') api.apply(!!enabled);
    else if (audio && enabled) { audio.muted = false; audio.currentTime = 0; audio.play().catch(function() {}); }
    else if (audio) { audio.pause(); audio.currentTime = 0; audio.muted = true; }
    if (audio) audio.volume = 0.2;
}

/**
 * Applies initial audio state.
 * The operation is isolated here to keep behavior predictable.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplMenuApplyInitialAudioState() {
    let api = eplMenuGetSoundApi();
    let audio = eplMenuGetAudio();
    let enabled = eplMenuIsSoundEnabled();
    if (api && typeof api.init === 'function') api.init();
    if (!audio) return enabled;
    audio.removeAttribute('autoplay');
    audio.volume = 0.2;
    audio.muted = !enabled;
    if (!enabled) { audio.pause(); audio.currentTime = 0; }
    return enabled;
}

/**
 * Updates sound toggle.
 * This synchronizes runtime state with current inputs.
 * @param {Function} toggle - Function callback invoked by this routine.
 * @param {boolean} enabled - Boolean flag controlling this branch.
 */
function eplMenuUpdateSoundToggle(toggle, enabled) {
    let stateLabel;
    if (!toggle) return;
    toggle.classList.toggle('is-off', !enabled);
    toggle.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    stateLabel = toggle.querySelector('[data-state]');
    if (stateLabel) stateLabel.textContent = enabled ? 'an' : 'aus';
}

/**
 * Handles sound toggle.
 * It applies side effects required by this branch.
 */
function eplMenuHandleSoundToggle() {
    let api = eplMenuGetSoundApi();
    let toggle = document.getElementById('sound-toggle');
    let next = !eplMenuIsSoundEnabled();
    localStorage.setItem(eplMenuGetSoundKey(), next ? 'true' : 'false');
    if (api && typeof api.setEnabled === 'function') api.setEnabled(next);
    else if (api && typeof api.toggle === 'function') next = api.toggle();
    else eplMenuApplySoundState(next);
    eplMenuUpdateSoundToggle(toggle, next);
}

/**
 * Initializes sound toggle.
 * It is part of the module startup flow.
 */
function eplMenuSetupSoundToggle() {
    let toggle = document.getElementById('sound-toggle');
    let initial;
    if (!toggle || state.soundBound) return;
    state.soundBound = true;
    toggle.addEventListener('click', eplMenuHandleSoundToggle);
    initial = eplMenuIsSoundEnabled();
    eplMenuApplySoundState(initial);
    eplMenuUpdateSoundToggle(toggle, initial);
}

/**
 * Initializes controls toggle.
 * It is part of the module startup flow.
 */
function eplMenuSetupControlsToggle() {
    let button = document.getElementById('controls-toggle');
    let list = document.getElementById('controls-list');
    let expanded = false;
    if (!button || !list || state.controlsBound) return;
    state.controlsBound = true;
    button.addEventListener('click', function() { expanded = !expanded; eplMenuRenderControls(button, list, expanded); });
    eplMenuRenderControls(button, list, expanded);
}

/**
 * Executes the epl menu render controls routine.
 * The logic is centralized here for maintainability.
 * @param {object} button - Object argument used by this routine.
 * @param {Array<unknown>} list - Array argument consumed by this routine.
 * @param {boolean} expanded - Boolean flag controlling this branch.
 */
function eplMenuRenderControls(button, list, expanded) {
    list.classList.toggle('collapsed', !expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.textContent = expanded ? 'Steuerung verbergen' : 'Steuerung anzeigen';
    button.classList.toggle('is-expanded', expanded);
}

/**
 * Plays on gesture once.
 * The operation is isolated here to keep behavior predictable.
 */
function eplMenuTryPlayOnGestureOnce() {
    let handler;
    if (state.gestureBound) return;
    state.gestureBound = true;
    /**
     * Executes the handler routine.
     * The logic is centralized here for maintainability.
     */
    handler = function() {
        let api = eplMenuGetSoundApi();
        let audio = eplMenuGetAudio();
        if (api && typeof api.tryPlayOnGesture === 'function') api.tryPlayOnGesture();
        else if (eplMenuIsSoundEnabled() && audio && audio.paused) { audio.currentTime = 0; audio.volume = 0.2; audio.play().catch(function() {}); }
        document.removeEventListener('click', handler); document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler); document.addEventListener('keydown', handler);
}

/**
 * Executes the epl menu read session flag routine.
 * The logic is centralized here for maintainability.
 * @param {unknown} key - Input value used by this routine.
 */
function eplMenuReadSessionFlag(key) {
    try { return sessionStorage.getItem(key) === '1'; }
    catch (e) { return false; }
}

/**
 * Initializes start button.
 * It is part of the module startup flow.
 */
function eplMenuSetupStartButton() {
    let button = document.querySelector('.start-button');
    if (!button || state.startBound) return;
    state.startBound = true;
    button.addEventListener('click', function(e) {
        let href;
        if (!(eplMenuReadSessionFlag('epl_index_ready') && eplMenuReadSessionFlag('epl_menu_back'))) return;
        e.preventDefault(); try { sessionStorage.setItem('epl_force_restart', '1'); sessionStorage.removeItem('epl_menu_back'); } catch (err) {}
        href = button.getAttribute('href'); history.forward(); setTimeout(function() { if (window.location.href.indexOf('menu.html') !== -1) window.location.href = href; }, 120);
    });
}

/**
 * Handles dom ready.
 * It applies side effects required by this branch.
 */
function eplMenuOnDomReady() {
    if (state.booted) return;
    state.booted = true;
    eplMenuApplyInitialAudioState();
    eplMenuSetupSoundToggle();
    eplMenuSetupControlsToggle();
    eplMenuTryPlayOnGestureOnce();
    eplMenuSetupStartButton();
}

/**
 * Executes the epl menu boot routine.
 * The logic is centralized here for maintainability.
 */
function eplMenuBoot() {
    if (state.domBound) return;
    state.domBound = true;
    document.addEventListener('DOMContentLoaded', eplMenuOnDomReady);
}
eplMenuBoot();
