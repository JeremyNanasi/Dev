(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.SoundManager) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let STORAGE_KEY = 'sound-enabled';

    function SoundManager() {
        this.audioElement = null;
        this.initialized = false;
    }

    SoundManager.prototype.init = function() {
        if (this.initialized) return;
        this.initialized = true;
        this.audioElement = document.getElementById('background-music');
        if (this.audioElement) this.audioElement.removeAttribute('autoplay');
        let enabled = this.isEnabled();
        if (this.audioElement) this.audioElement.muted = !enabled;
    };

    SoundManager.prototype.getAudio = function() {
        if (!this.audioElement) this.audioElement = document.getElementById('background-music');
        return this.audioElement;
    };

    SoundManager.prototype.isEnabled = function() {
        return localStorage.getItem(STORAGE_KEY) !== 'false';
    };

    SoundManager.prototype.setEnabled = function(enabled) {
        localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
        this.apply(enabled);
    };

    SoundManager.prototype.apply = function(enabled) {
        let audio = this.getAudio();
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
    };

    SoundManager.prototype.toggle = function() {
        let next = !this.isEnabled();
        this.setEnabled(next);
        return next;
    };

    SoundManager.prototype.tryPlayOnGesture = function() {
        if (!this.isEnabled()) return;
        let audio = this.getAudio();
        if (audio && audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(function() {});
        }
    };

    window.EPL.Controllers.SoundManager = SoundManager;
    window.EPL.Sound = new SoundManager();
})();
