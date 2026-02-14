(function() {
    function isSoundEnabled() {
        let key = window.EPL ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
        return localStorage.getItem(key) !== 'false';
    }

    function applySoundState(enabled) {
        let audio = document.getElementById('background-music');
        if (!audio) return;
        audio.volume = 0.5;
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
        let toggle = document.getElementById('sound-toggle');
        if (!toggle) return;

        let updateToggle = function(enabled) {
            toggle.classList.toggle('is-off', !enabled);
            toggle.setAttribute('aria-pressed', enabled ? 'false' : 'true');
            let stateLabel = toggle.querySelector('[data-state]');
            if (stateLabel) {
                stateLabel.textContent = enabled ? 'an' : 'aus';
            }
        };


        toggle.addEventListener('click', function() {
            let nextEnabled = !isSoundEnabled();
            let key = window.EPL ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
            localStorage.setItem(key, nextEnabled ? 'true' : 'false');
            applySoundState(nextEnabled);
            updateToggle(nextEnabled);
        });

        let initial = isSoundEnabled();
        applySoundState(initial);
        updateToggle(initial);
    }

    function setupControlsToggle() {
        let toggleButton = document.getElementById('controls-toggle');
        let menuList = document.getElementById('controls-list');
        if (!toggleButton || !menuList) return;

        let expanded = false;
        let updateUi = function() {
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
        let handler = function() {
            if (isSoundEnabled()) {
                let audio = document.getElementById('background-music');
                if (audio && audio.paused) {
                    audio.currentTime = 0; audio.volume = 0.5;
                    audio.play().catch(function() {});
                }
            }
            document.removeEventListener('click', handler);
            document.removeEventListener('keydown', handler);
        };
        document.addEventListener('click', handler);
        document.addEventListener('keydown', handler);
    }

    function readSessionFlag(key) {
        try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
    }

    function setupStartButton() {
        let button = document.querySelector('.start-button');
        if (!button) return;
        button.addEventListener('click', function(e) {
            if (!(readSessionFlag('epl_index_ready') && readSessionFlag('epl_menu_back'))) return;
            e.preventDefault();
            try { sessionStorage.setItem('epl_force_restart','1'); sessionStorage.removeItem('epl_menu_back'); } catch (err) {}
            let href = button.getAttribute('href');
            history.forward();
            setTimeout(function() { if (window.location.href.indexOf('menu.html') !== -1) window.location.href = href; }, 120);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        let audio = document.getElementById('background-music');
        if (audio) {
            audio.removeAttribute('autoplay');
            let enabled = isSoundEnabled();
            audio.muted = !enabled; audio.volume = 0.5;
            if (!enabled) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
        setupSoundToggle();
        setupControlsToggle();
        initSoundOnGesture();
        setupStartButton();
    });
})();
