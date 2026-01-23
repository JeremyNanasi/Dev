(function() {
    if (window.EPL && window.EPL.Sound) return;
    if (!window.EPL) window.EPL = {};

    var audioElement = null;
    var initialized = false;

    function getAudio() {
        if (!audioElement) {
            audioElement = document.getElementById('background-music');
        }
        return audioElement;
    }

    function isEnabled() {
        return localStorage.getItem(window.EPL.KEYS.SOUND_ENABLED) !== 'false';
    }

    function setEnabled(enabled) {
        localStorage.setItem(window.EPL.KEYS.SOUND_ENABLED, enabled ? 'true' : 'false');
        applyState(enabled);
    }

    function applyState(enabled) {
        var audio = getAudio();
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
        var next = !isEnabled();
        setEnabled(next);
        return next;
    }

    function init() {
        if (initialized) return;
        initialized = true;

        var audio = getAudio();
        if (audio) {
            audio.removeAttribute('autoplay');
        }

        var enabled = isEnabled();
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
        var audio = getAudio();
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
