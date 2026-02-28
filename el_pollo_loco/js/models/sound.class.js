/**
 * @fileoverview
 * Global sound manager responsible for background music and SFX playback policies across the game lifecycle.
 *
 * Exposed under `window.EPL.Controllers.SoundManager`.
 */
window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};
window.EPL.Controllers.SoundManager = window.EPL.Controllers.SoundManager || class SoundManager {

    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     */
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

    /**
     * Returns the storage key.
     * This helper centralizes read access for callers.
     * @returns {string} Returns the resulting string value.
     */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.SOUND_ENABLED ? window.EPL.KEYS.SOUND_ENABLED : 'sound-enabled';
    }

    /**
     * Initializes routine.
     * It is part of the module startup flow.
     */
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

    /**
     * Returns the audio.
     * This helper centralizes read access for callers.
     * @returns {unknown} Returns the value produced by this routine.
     */
    getAudio() {
        if (!this.audioElement) this.audioElement = document.getElementById('background-music');
        return this.audioElement;
    }

    /**
     * Creates SFX.
     * The result is consumed by downstream game logic.
     * @param {string} src - String value used by this routine.
     * @returns {unknown} Returns the value produced by this routine.
     */
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

    /**
     * Evaluates the enabled condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isEnabled() {
        return localStorage.getItem(this.getStorageKey()) !== 'false';
    }

    /**
     * Executes the normalize path routine.
     * The logic is centralized here for maintainability.
     * @param {string} src - String value used by this routine.
     * @returns {string} Returns the resulting string value.
     */
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

    /**
     * Evaluates the whitelisted condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {HTMLAudioElement} srcOrAudio - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    isWhitelisted(srcOrAudio) {
        let path = this.normalizePath(srcOrAudio);
        if (!path || this.whitelistGateSet.size === 0) return false;
        if (this.whitelistGateSet.has(path)) return true;
        for (let allowed of this.whitelistGateSet) if (path.endsWith(allowed)) return true;
        return false;
    }

    /**
     * Evaluates the allow playback condition.
     * Returns whether the current runtime state satisfies that condition.
     * @param {unknown} target - Input value used by this routine.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    shouldAllowPlayback(target) {
        if (this.endStateMuted) return false;
        if (!this.isEnabled()) return false;
        if (!this.whitelistGateEnabled) return true;
        return this.isWhitelisted(target);
    }

    /**
     * Executes the enable whitelist gate routine.
     * The logic is centralized here for maintainability.
     * @param {unknown} allowedPathsArray - Input value used by this routine.
     */
    enableWhitelistGate(allowedPathsArray) {
        let paths = Array.isArray(allowedPathsArray) ? allowedPathsArray : [];
        this.whitelistGateSet = new Set(paths.map(this.normalizePath.bind(this)).filter(Boolean));
        this.whitelistGateEnabled = true;
        this.enforceWhitelistNow();
    }

    /**
     * Executes the disable whitelist gate routine.
     * The logic is centralized here for maintainability.
     */
    disableWhitelistGate() {
        this.whitelistGateEnabled = false;
        this.whitelistGateSet.clear();
    }

    /**
     * Executes the enforce whitelist now routine.
     * The logic is centralized here for maintainability.
     */
    enforceWhitelistNow() {
        let self = this;
        /**
         * Stops routine.
         * The operation is isolated here to keep behavior predictable.
         * @param {object} media - Object argument used by this routine.
         */
        let stop = function(media) {
            if (!media || self.isWhitelisted(media)) return;
            media.pause();
            media.currentTime = 0;
            media.muted = true;
        };
        this.mediaRegistry.forEach(stop);
        document.querySelectorAll('audio,video').forEach(stop);
    }

    /**
     * Plays gate.
     * The operation is isolated here to keep behavior predictable.
     */
    installMediaPlayGate() {
        let manager = this;
        let nativePlay;
        if (this.playGateInstalled || typeof HTMLMediaElement === 'undefined') return;
        this.playGateInstalled = true;
        nativePlay = HTMLMediaElement.prototype.play;
        /**
         * Plays routine.
         * The operation is isolated here to keep behavior predictable.
         * @returns {unknown} Returns the value produced by this routine.
         */
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

    /**
     * Sets the enabled.
     * This keeps persistent and in-memory state aligned.
     * @param {boolean} enabled - Boolean flag controlling this branch.
     */
    setEnabled(enabled) {
        localStorage.setItem(this.getStorageKey(), enabled ? 'true' : 'false');
        this.apply(enabled);
    }

    /**
     * Applies routine.
     * The operation is isolated here to keep behavior predictable.
     * @param {boolean} enabled - Boolean flag controlling this branch.
     */
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

    /**
     * Toggles routine.
     * The operation is isolated here to keep behavior predictable.
     * @returns {unknown} Returns the value produced by this routine.
     */
    toggle() {
        let next = !this.isEnabled();
        this.setEnabled(next);
        return next;
    }

    /**
     * Plays on gesture.
     * The operation is isolated here to keep behavior predictable.
     */
    tryPlayOnGesture() {
        let audio = this.getAudio();
        if (this.endStateMuted || this.pausedForEnd || !audio || !this.shouldAllowPlayback(audio)) return;
        if (!audio.paused) return;
        audio.currentTime = 0;
        audio.volume = 0.2;
        audio.play().catch(function() {});
    }

    /**
     * Executes the mute for end state routine.
     * The logic is centralized here for maintainability.
     */
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

    /**
     * Executes the clear end state mute routine.
     * The logic is centralized here for maintainability.
     */
    clearEndStateMute() {
        this.endStateMuted = false;
        this.pausedForEnd = false;
        this.disableWhitelistGate();
        if (this.isEnabled()) this.apply(true);
    }

    /**
     * Executes the pause for end routine.
     * The logic is centralized here for maintainability.
     */
    pauseForEnd() {
        this.muteForEndState();
    }

    /**
     * Executes the resume from end routine.
     * The logic is centralized here for maintainability.
     */
    resumeFromEnd() {
        this.clearEndStateMute();
    }
};
window.__epl_sound_singleton = window.__epl_sound_singleton || new window.EPL.Controllers.SoundManager();
window.EPL.Sound = window.__epl_sound_singleton;
