let state = window.__epl_menu_state || (window.__epl_menu_state = {
    domBound: false,
    booted: false,
    soundBound: false,
    controlsBound: false,
    gestureBound: false,
    startBound: false
});

/** Return the global sound API when available. @returns {*|null} */
function eplMenuGetSoundApi() {
    return window.EPL && window.EPL.Sound ? window.EPL.Sound : null;
}

/** Return the localStorage key for sound preferences. @returns {string} */
function eplMenuGetSoundKey() {
    let keys = window.EPL && window.EPL.KEYS ? window.EPL.KEYS : {};
    return keys.SOUND_ENABLED || 'sound-enabled';
}

/** Return whether menu sound is currently enabled. @returns {boolean} */
function eplMenuIsSoundEnabled() {
    let api = eplMenuGetSoundApi();
    if (api && typeof api.isEnabled === 'function') return api.isEnabled();
    return localStorage.getItem(eplMenuGetSoundKey()) !== 'false';
}

/** Return the background audio element used in the menu. @returns {HTMLAudioElement|null} */
function eplMenuGetAudio() {
    let api = eplMenuGetSoundApi();
    if (api && typeof api.getAudio === 'function') return api.getAudio();
    return document.getElementById('background-music');
}

/** Apply the selected menu sound state. @param {boolean} enabled */
function eplMenuApplySoundState(enabled) {
    let api = eplMenuGetSoundApi();
    let audio = eplMenuGetAudio();
    if (api && typeof api.applyState === 'function') api.applyState(!!enabled);
    else if (api && typeof api.apply === 'function') api.apply(!!enabled);
    else if (audio && enabled) { audio.muted = false; audio.currentTime = 0; audio.play().catch(function() {}); }
    else if (audio) { audio.pause(); audio.currentTime = 0; audio.muted = true; }
    if (audio) audio.volume = 0.2;
}

/** Apply initial menu audio preferences and return enabled state. @returns {boolean} */
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

/** Update the sound toggle UI state. @param {HTMLElement|null} toggle @param {boolean} enabled */
function eplMenuUpdateSoundToggle(toggle, enabled) {
    let stateLabel;
    if (!toggle) return;
    toggle.classList.toggle('is-off', !enabled);
    toggle.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    stateLabel = toggle.querySelector('[data-state]');
    if (stateLabel) stateLabel.textContent = enabled ? 'an' : 'aus';
}

/** Toggle sound preference from the menu UI. */
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

/** Wire the sound toggle button once. */
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

/** Wire the expandable controls list button once. */
function eplMenuSetupControlsToggle() {
    let button = document.getElementById('controls-toggle');
    let list = document.getElementById('controls-list');
    let expanded = false;
    if (!button || !list || state.controlsBound) return;
    state.controlsBound = true;
    button.addEventListener('click', function() { expanded = !expanded; eplMenuRenderControls(button, list, expanded); });
    eplMenuRenderControls(button, list, expanded);
}

/** Render the controls toggle state. @param {HTMLElement} button @param {HTMLElement} list @param {boolean} expanded */
function eplMenuRenderControls(button, list, expanded) {
    list.classList.toggle('collapsed', !expanded);
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    button.textContent = expanded ? 'Steuerung verbergen' : 'Steuerung anzeigen';
    button.classList.toggle('is-expanded', expanded);
}

/** Install one-time gesture playback unlock handlers. */
function eplMenuTryPlayOnGestureOnce() {
    let handler;
    if (state.gestureBound) return;
    state.gestureBound = true;
    /** Handle first click or keydown gesture for audio playback. */
    handler = function() {
        let api = eplMenuGetSoundApi();
        let audio = eplMenuGetAudio();
        if (api && typeof api.tryPlayOnGesture === 'function') api.tryPlayOnGesture();
        else if (eplMenuIsSoundEnabled() && audio && audio.paused) { audio.currentTime = 0; audio.volume = 0.2; audio.play().catch(function() {}); }
        document.removeEventListener('click', handler); document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler); document.addEventListener('keydown', handler);
}

/** Read a boolean session flag value. @param {string} key @returns {boolean} */
function eplMenuReadSessionFlag(key) {
    try { return sessionStorage.getItem(key) === '1'; }
    catch (e) { return false; }
}

/** Wire the start button restart-forward behavior once. */
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

/** Run menu bootstrap logic after DOM ready. */
function eplMenuOnDomReady() {
    if (state.booted) return;
    state.booted = true;
    eplMenuApplyInitialAudioState();
    eplMenuSetupSoundToggle();
    eplMenuSetupControlsToggle();
    eplMenuTryPlayOnGestureOnce();
    eplMenuSetupStartButton();
}

/** Bind DOM-ready bootstrap exactly once. */
function eplMenuBoot() {
    if (state.domBound) return;
    state.domBound = true;
    document.addEventListener('DOMContentLoaded', eplMenuOnDomReady);
}

eplMenuBoot();
