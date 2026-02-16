/**
 * @fileoverview Registers `window.EPL.Sound` with simple background-audio controls.
 */
(function() {
    if (window.EPL && window.EPL.Sound) return;
    if (!window.EPL) window.EPL = {};

    let audioElement = null;
    let initialized = false;

    /**
     * Resolves and caches the menu background audio element.
     * @returns {HTMLAudioElement|null}
     */
    function getAudio() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        return audioElement;
    }

    function isEnabled() {
        return localStorage.getItem(window.EPL.KEYS.SOUND_ENABLED) !== 'false';
    }

    /**
     * Persists the sound preference and applies it immediately.
     * @param {boolean} enabled
     * @returns {void}
     */
    function setEnabled(enabled) {
        localStorage.setItem(window.EPL.KEYS.SOUND_ENABLED, enabled ? 'true' : 'false');
        applyState(enabled);
    }

    function applyState(enabled) {
        let audio = getAudio();
        if (!audio) return;

        if (enabled) {
            audio.muted = false;
            audio.currentTime = 0;
            audio.play().catch(function() {});
        } else {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = true;
        }
    }

    function toggle() {
        let next = !isEnabled();
        setEnabled(next);
        return next;
    }

    /**
     * One-time setup that restores stored mute state.
     * @returns {void}
     */
    function init() {
        if (initialized) return;
        initialized = true;

        let audio = getAudio();
        if (audio) {
            audio.removeAttribute('autoplay');
        }

        let enabled = isEnabled();
        if (audio) {
            audio.muted = !enabled;
            if (!enabled) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }

    function tryPlayOnGesture() {
        if (!isEnabled()) return;
        let audio = getAudio();
        if (audio && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(function() {});
        }
    }

    window.EPL.Sound = {
        init: init,
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        toggle: toggle,
        applyState: applyState,
        tryPlayOnGesture: tryPlayOnGesture,
        getAudio: getAudio
    };
})();
