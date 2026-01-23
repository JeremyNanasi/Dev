(function() {
    function isSoundEnabled() {
        var key = window.EPL ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }

    function applySoundState(enabled) {
        var audio = document.getElementById('background-music');
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

    function setupSoundToggle() {
        var toggle = document.getElementById('sound-toggle');
        if (!toggle) return;

        var updateToggle = function(enabled) {
            toggle.classList.toggle('is-off', !enabled);
            toggle.setAttribute('aria-pressed', enabled ? 'false' : 'true');
            var stateLabel = toggle.querySelector('[data-state]');
            if (stateLabel) {
                stateLabel.textContent = enabled ? 'an' : 'aus';
            }
        };

        toggle.addEventListener('click', function() {
            var nextEnabled = !isSoundEnabled();
            var key = window.EPL ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
            localStorage.setItem(key, nextEnabled ? 'true' : 'false');
            applySoundState(nextEnabled);
            updateToggle(nextEnabled);
        });

        var initial = isSoundEnabled();
        applySoundState(initial);
        updateToggle(initial);
    }

    function setupControlsToggle() {
        var toggleButton = document.getElementById('controls-toggle');
        var menuList = document.getElementById('controls-list');
        if (!toggleButton || !menuList) return;

        var expanded = false;
        var updateUi = function() {
            menuList.classList.toggle('collapsed', !expanded);
            toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleButton.textContent = expanded ? 'Steuerung verbergen' : 'Steuerung anzeigen';
            toggleButton.classList.toggle('is-expanded', expanded);
        };

        toggleButton.addEventListener('click', function() {
            expanded = !expanded;
            updateUi();
        });

        updateUi();
    }

    function initSoundOnGesture() {
        var handler = function() {
            if (isSoundEnabled()) {
                var audio = document.getElementById('background-music');
                if (audio && audio.paused) {
                    audio.currentTime = 0;
                    audio.play().catch(function() {});
                }
            }
            document.removeEventListener('click', handler);
            document.removeEventListener('keydown', handler);
        };
        document.addEventListener('click', handler);
        document.addEventListener('keydown', handler);
    }

    document.addEventListener('DOMContentLoaded', function() {
        var audio = document.getElementById('background-music');
        if (audio) {
            audio.removeAttribute('autoplay');
            var enabled = isSoundEnabled();
            audio.muted = !enabled;
            if (!enabled) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
        setupSoundToggle();
        setupControlsToggle();
        initSoundOnGesture();
    });
})();
