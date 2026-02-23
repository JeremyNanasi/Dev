/**
 * @fileoverview Sound manager controller for persistent mute state in gameplay.
 */
(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.SoundManager) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let STORAGE_KEY = 'sound-enabled';

    /**
     * Creates a sound manager for the background music element.
     */
    function SoundManager() {
        this.audioElement = null;
        this.initialized = false;
        this.pausedForEnd = false;
        this.endStateMuted = false;
        this.whitelistGateEnabled = false;
        this.whitelistGateSet = new Set();
        this.mediaRegistry = new Set();
        this.playGateInstalled = false;
        this.installMediaPlayGate();
    }

    /**
     * Initializes audio element reference and applies stored state.
     * @returns {void}
     */
    SoundManager.prototype.init = function() {
        if (this.initialized) return;
        this.initialized = true;
        this.audioElement = document.getElementById('background-music');
        if (this.audioElement) this.audioElement.removeAttribute('autoplay');
        let enabled = this.isEnabled();
        if (this.audioElement) this.audioElement.muted = !enabled;
        if (this.audioElement) this.audioElement.volume = 0.2;
    };

    SoundManager.prototype.getAudio = function() {
        if (!this.audioElement) this.audioElement = document.getElementById('background-music');
        return this.audioElement;
    };

    SoundManager.prototype.isEnabled = function() {
        return localStorage.getItem(STORAGE_KEY) !== 'false';
    };

    SoundManager.prototype.normalizePath = function(src) {
        let raw = typeof src === 'string' ? src : (src?.currentSrc || src?.src || '');
        if (!raw) return '';
        let path = String(raw).replace(/\\/g, '/').split('#')[0].split('?')[0];
        let idx = path.indexOf('/img/');
        if (idx >= 0) path = path.slice(idx + 1);
        if (path.startsWith('./')) path = path.slice(2);
        if (path.startsWith('/')) path = path.slice(1);
        return path;
    };

    SoundManager.prototype.isWhitelisted = function(srcOrAudio) {
        let path = this.normalizePath(srcOrAudio);
        if (!path || this.whitelistGateSet.size === 0) return false;
        if (this.whitelistGateSet.has(path)) return true;
        for (const allowed of this.whitelistGateSet) if (path.endsWith(allowed)) return true;
        return false;
    };

    SoundManager.prototype.shouldAllowPlayback = function(target) {
        if (this.endStateMuted) return false;
        if (!this.isEnabled()) return false;
        if (!this.whitelistGateEnabled) return true;
        return this.isWhitelisted(target);
    };

    SoundManager.prototype.enableWhitelistGate = function(allowedPathsArray) {
        let paths = Array.isArray(allowedPathsArray) ? allowedPathsArray : [];
        this.whitelistGateSet = new Set(paths.map((path) => this.normalizePath(path)).filter(Boolean));
        this.whitelistGateEnabled = true;
        this.enforceWhitelistNow();
    };

    SoundManager.prototype.disableWhitelistGate = function() {
        this.whitelistGateEnabled = false;
        this.whitelistGateSet.clear();
    };

    SoundManager.prototype.enforceWhitelistNow = function() {
        /** Runs `stop`. @param {*} media - Value. @returns {*} Result. */
        const stop = (media) => {
            if (!media || this.isWhitelisted(media)) return;
            media.pause();
            media.currentTime = 0;
            media.muted = true;
        };
        this.mediaRegistry.forEach(stop);
        document.querySelectorAll('audio,video').forEach(stop);
    };

    SoundManager.prototype.installMediaPlayGate = function() {
        if (this.playGateInstalled || typeof HTMLMediaElement === 'undefined') return;
        this.playGateInstalled = true;
        const manager = this, nativePlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function() {
            manager.mediaRegistry.add(this);
            if (!manager.shouldAllowPlayback(this)) { manager.enforceWhitelistNow(); return Promise.resolve(); }
            this.muted = false;
            return nativePlay.apply(this, arguments);
        };
    };

    /**
     * Persists enabled state and applies it to the audio element.
     * @param {boolean} enabled
     * @returns {void}
     */
    SoundManager.prototype.setEnabled = function(enabled) {
        localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
        this.apply(enabled);
    };

    SoundManager.prototype.apply = function(enabled) {
        let audio = this.getAudio();
        if (!audio) return;
        audio.volume = 0.2;
        if (enabled && !this.pausedForEnd && this.shouldAllowPlayback(audio)) {
            audio.muted = false;
            audio.currentTime = 0;
            audio.play().catch(function() {});
            return;
        }
        audio.pause(); audio.currentTime = 0; audio.muted = true;
        if (!enabled) this.enforceWhitelistNow();
    };

    SoundManager.prototype.toggle = function() {
        let next = !this.isEnabled();
        this.setEnabled(next);
        return next;
    };

    SoundManager.prototype.tryPlayOnGesture = function() {
        let audio = this.getAudio();
        if (this.endStateMuted || this.pausedForEnd || !audio || !this.shouldAllowPlayback(audio)) return;
        if (audio && audio.paused) {
            audio.currentTime = 0; audio.volume = 0.2;
            audio.play().catch(function() {});
        }
    };

    SoundManager.prototype.muteForEndState = function() {
        if (this.endStateMuted) return;
        this.endStateMuted = true;
        this.pausedForEnd = true;
        this.enableWhitelistGate([]);
        this.enforceWhitelistNow();
        let audio = this.getAudio();
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
    };

    SoundManager.prototype.clearEndStateMute = function() {
        this.endStateMuted = false;
        this.pausedForEnd = false;
        this.disableWhitelistGate();
        if (this.isEnabled()) this.apply(true);
    };

    SoundManager.prototype.pauseForEnd = function() {
        this.muteForEndState();
    };

    SoundManager.prototype.resumeFromEnd = function() {
        this.clearEndStateMute();
    };

    window.EPL.Controllers.SoundManager = SoundManager;
    window.EPL.Sound = new SoundManager();
})();
