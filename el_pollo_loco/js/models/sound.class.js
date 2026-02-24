window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.SoundManager = window.EPL.Controllers.SoundManager || class SoundManager {
    /** Initialize global sound manager state. */
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

    /** Return the storage key for sound preference. @returns {string} */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.SOUND_ENABLED ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
    }

    /** Initialize background audio state once. */
    init() {
        let enabled;
        if (this.initialized) return;
        this.initialized = true;
        this.audioElement = document.getElementById('background-music');
        if (this.audioElement) this.audioElement.removeAttribute('autoplay');
        enabled = this.isEnabled();
        if (this.audioElement) this.audioElement.muted = !enabled;
        if (this.audioElement) this.audioElement.volume = 0.2;
    }

    /** Return the cached or resolved background audio element. @returns {HTMLAudioElement|null} */
    getAudio() {
        if (!this.audioElement) this.audioElement = document.getElementById('background-music');
        return this.audioElement;
    }

    /** Create an SFX audio element with retry-on-error. @param {string} src @returns {HTMLAudioElement} */
    createSfx(src) {
        let base = String(src || '');
        let audio = new Audio(base);
        audio.__eplRetried = false;
        audio.addEventListener('error', function() {
            let token;
            if (audio.__eplRetried || !base) return;
            audio.__eplRetried = true;
            token = window.__epl_cache_bust_token || (window.__epl_cache_bust_token = Date.now());
            audio.src = base + (base.indexOf('?') >= 0 ? '&' : '?') + '_eplcb=' + token;
            audio.load();
        }, { once: true });
        return audio;
    }

    /** Return whether sound is enabled in storage. @returns {boolean} */
    isEnabled() {
        return localStorage.getItem(this.getStorageKey()) !== 'false';
    }

    /** Normalize an audio source path for whitelist matching. @param {*=} src @returns {string} */
    normalizePath(src) {
        let raw = typeof src === 'string' ? src : (src && (src.currentSrc || src.src || ''));
        let path;
        let idx;
        if (!raw) return '';
        path = String(raw).replace(/\\/g, '/').split('#')[0].split('?')[0];
        idx = path.indexOf('/img/');
        if (idx >= 0) path = path.slice(idx + 1);
        if (path.indexOf('./') === 0) path = path.slice(2);
        if (path.indexOf('/') === 0) path = path.slice(1);
        return path;
    }

    /** Return whether a source is allowed by whitelist rules. @param {*=} srcOrAudio @returns {boolean} */
    isWhitelisted(srcOrAudio) {
        let path = this.normalizePath(srcOrAudio);
        if (!path || this.whitelistGateSet.size === 0) return false;
        if (this.whitelistGateSet.has(path)) return true;
        for (let allowed of this.whitelistGateSet) if (path.endsWith(allowed)) return true;
        return false;
    }

    /** Return whether playback should be allowed for a media target. @param {*=} target @returns {boolean} */
    shouldAllowPlayback(target) {
        if (this.endStateMuted) return false;
        if (!this.isEnabled()) return false;
        if (!this.whitelistGateEnabled) return true;
        return this.isWhitelisted(target);
    }

    /** Enable whitelist playback gating for allowed paths. @param {string[]} allowedPathsArray */
    enableWhitelistGate(allowedPathsArray) {
        let paths = Array.isArray(allowedPathsArray) ? allowedPathsArray : [];
        this.whitelistGateSet = new Set(paths.map(this.normalizePath.bind(this)).filter(Boolean));
        this.whitelistGateEnabled = true;
        this.enforceWhitelistNow();
    }

    /** Disable whitelist playback gating. */
    disableWhitelistGate() {
        this.whitelistGateEnabled = false;
        this.whitelistGateSet.clear();
    }

    /** Pause and mute media that is not currently whitelisted. */
    enforceWhitelistNow() {
        let self = this;
        /** Stop non-whitelisted media playback. @param {HTMLMediaElement} media */
        let stop = function(media) {
            if (!media || self.isWhitelisted(media)) return;
            media.pause();
            media.currentTime = 0;
            media.muted = true;
        };
        this.mediaRegistry.forEach(stop);
        document.querySelectorAll('audio,video').forEach(stop);
    }

    /** Install a global HTMLMediaElement play gate once. */
    installMediaPlayGate() {
        let manager = this;
        let nativePlay;
        if (this.playGateInstalled || typeof HTMLMediaElement === 'undefined') return;
        this.playGateInstalled = true;
        nativePlay = HTMLMediaElement.prototype.play;
        /** Gate media playback through manager policy. @returns {Promise<void>|undefined} */
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

    /** Persist and apply a new sound enabled state. @param {boolean} enabled */
    setEnabled(enabled) {
        localStorage.setItem(this.getStorageKey(), enabled ? 'true' : 'false');
        this.apply(enabled);
    }

    /** Apply sound playback state to background audio. @param {boolean} enabled */
    apply(enabled) {
        let audio = this.getAudio();
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

    /** Toggle and return the new sound enabled state. @returns {boolean} */
    toggle() {
        let next = !this.isEnabled();
        this.setEnabled(next);
        return next;
    }

    /** Try to play background audio after a user gesture. */
    tryPlayOnGesture() {
        let audio = this.getAudio();
        if (this.endStateMuted || this.pausedForEnd || !audio || !this.shouldAllowPlayback(audio)) return;
        if (!audio.paused) return;
        audio.currentTime = 0;
        audio.volume = 0.2;
        audio.play().catch(function() {});
    }

    /** Mute all playback for end-state screens. */
    muteForEndState() {
        let audio;
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

    /** Clear end-state mute and restore normal playback policy. */
    clearEndStateMute() {
        this.endStateMuted = false;
        this.pausedForEnd = false;
        this.disableWhitelistGate();
        if (this.isEnabled()) this.apply(true);
    }

    /** Alias muteForEndState for existing call sites. */
    pauseForEnd() {
        this.muteForEndState();
    }

    /** Alias clearEndStateMute for existing call sites. */
    resumeFromEnd() {
        this.clearEndStateMute();
    }
};

window.__epl_sound_singleton = window.__epl_sound_singleton || new window.EPL.Controllers.SoundManager();
window.EPL.Sound = window.__epl_sound_singleton;
