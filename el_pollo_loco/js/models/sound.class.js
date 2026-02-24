window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.SoundManager = window.EPL.Controllers.SoundManager || class SoundManager {
    constructor() {
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

    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.SOUND_ENABLED ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
    }

    init() {
        var enabled;
        if (this.initialized) return;
        this.initialized = true;
        this.audioElement = document.getElementById('background-music');
        if (this.audioElement) this.audioElement.removeAttribute('autoplay');
        enabled = this.isEnabled();
        if (this.audioElement) this.audioElement.muted = !enabled;
        if (this.audioElement) this.audioElement.volume = 0.2;
    }

    getAudio() {
        if (!this.audioElement) this.audioElement = document.getElementById('background-music');
        return this.audioElement;
    }

    isEnabled() {
        return localStorage.getItem(this.getStorageKey()) !== 'false';
    }

    normalizePath(src) {
        var raw = typeof src === 'string' ? src : (src && (src.currentSrc || src.src || ''));
        var path;
        var idx;
        if (!raw) return '';
        path = String(raw).replace(/\\/g, '/').split('#')[0].split('?')[0];
        idx = path.indexOf('/img/');
        if (idx >= 0) path = path.slice(idx + 1);
        if (path.indexOf('./') === 0) path = path.slice(2);
        if (path.indexOf('/') === 0) path = path.slice(1);
        return path;
    }

    isWhitelisted(srcOrAudio) {
        var path = this.normalizePath(srcOrAudio);
        if (!path || this.whitelistGateSet.size === 0) return false;
        if (this.whitelistGateSet.has(path)) return true;
        for (var allowed of this.whitelistGateSet) if (path.endsWith(allowed)) return true;
        return false;
    }

    shouldAllowPlayback(target) {
        if (this.endStateMuted) return false;
        if (!this.isEnabled()) return false;
        if (!this.whitelistGateEnabled) return true;
        return this.isWhitelisted(target);
    }

    enableWhitelistGate(allowedPathsArray) {
        var paths = Array.isArray(allowedPathsArray) ? allowedPathsArray : [];
        this.whitelistGateSet = new Set(paths.map(this.normalizePath.bind(this)).filter(Boolean));
        this.whitelistGateEnabled = true;
        this.enforceWhitelistNow();
    }

    disableWhitelistGate() {
        this.whitelistGateEnabled = false;
        this.whitelistGateSet.clear();
    }

    enforceWhitelistNow() {
        var self = this;
        var stop = function(media) {
            if (!media || self.isWhitelisted(media)) return;
            media.pause();
            media.currentTime = 0;
            media.muted = true;
        };
        this.mediaRegistry.forEach(stop);
        document.querySelectorAll('audio,video').forEach(stop);
    }

    installMediaPlayGate() {
        var manager = this;
        var nativePlay;
        if (this.playGateInstalled || typeof HTMLMediaElement === 'undefined') return;
        this.playGateInstalled = true;
        nativePlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function() {
            manager.mediaRegistry.add(this);
            if (!manager.shouldAllowPlayback(this)) {
                manager.enforceWhitelistNow();
                return Promise.resolve();
            }
            this.muted = false;
            return nativePlay.apply(this, arguments);
        };
    }

    setEnabled(enabled) {
        localStorage.setItem(this.getStorageKey(), enabled ? 'true' : 'false');
        this.apply(enabled);
    }

    apply(enabled) {
        var audio = this.getAudio();
        if (!audio) return;
        audio.volume = 0.2;
        if (enabled && !this.pausedForEnd && this.shouldAllowPlayback(audio)) {
            audio.muted = false;
            audio.currentTime = 0;
            audio.play().catch(function() {});
            return;
        }
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
        if (!enabled) this.enforceWhitelistNow();
    }

    toggle() {
        var next = !this.isEnabled();
        this.setEnabled(next);
        return next;
    }

    tryPlayOnGesture() {
        var audio = this.getAudio();
        if (this.endStateMuted || this.pausedForEnd || !audio || !this.shouldAllowPlayback(audio)) return;
        if (!audio.paused) return;
        audio.currentTime = 0;
        audio.volume = 0.2;
        audio.play().catch(function() {});
    }

    muteForEndState() {
        var audio;
        if (this.endStateMuted) return;
        this.endStateMuted = true;
        this.pausedForEnd = true;
        this.enableWhitelistGate([]);
        this.enforceWhitelistNow();
        audio = this.getAudio();
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
    }

    clearEndStateMute() {
        this.endStateMuted = false;
        this.pausedForEnd = false;
        this.disableWhitelistGate();
        if (this.isEnabled()) this.apply(true);
    }

    pauseForEnd() {
        this.muteForEndState();
    }

    resumeFromEnd() {
        this.clearEndStateMute();
    }
};

window.__epl_sound_singleton = window.__epl_sound_singleton || new window.EPL.Controllers.SoundManager();
window.EPL.Sound = window.__epl_sound_singleton;
