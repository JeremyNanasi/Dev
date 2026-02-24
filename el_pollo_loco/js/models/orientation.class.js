window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

/** Wrap an interval callback to no-op while orientation is blocked. @param {Function} cb @returns {Function} */
window.__epl_wrap_interval_callback = window.__epl_wrap_interval_callback || function(cb) {
    return function() {
        if (document.body && document.body.classList.contains('epl-orientation-blocked')) return;
        return cb.apply(this, arguments);
    };
};

/** Install a global setInterval guard once. */
window.__epl_install_interval_guard = window.__epl_install_interval_guard || function() {
    if (window.__epl_interval_guarded) return;
    window.__epl_original_set_interval = window.__epl_original_set_interval || window.setInterval;
    /** Wrap setInterval callbacks with orientation blocking checks. @param {*} cb @param {*} delay @returns {*} */
    window.setInterval = function(cb, delay) {
        if (typeof cb !== 'function') return window.__epl_original_set_interval(cb, delay);
        return window.__epl_original_set_interval(window.__epl_wrap_interval_callback(cb), delay);
    };
    window.__epl_interval_guarded = true;
};

window.EPL.Controllers.Orientation = window.EPL.Controllers.Orientation || class OrientationController {
    /** Initialize orientation controller dependencies. @param {{getCanvas:Function,getTarget:Function,resizeCanvas:Function,applyContainBaseStyles:Function,getCanvasWidth:Function,getCanvasHeight:Function}} deps */
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
        this.blockMql = null;
        this.blockHandler = null;
    }

    /** Return the storage key for orientation mode. @returns {string} */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.ORIENTATION_MODE ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    }

    /** Return the configured orientation mode list. @returns {string[]} */
    getModes() {
        let modes = window.EPL && Array.isArray(window.EPL.ORIENTATION_MODES) ? window.EPL.ORIENTATION_MODES : null;
        return modes && modes.length ? modes : ['auto', 'portrait', 'landscape'];
    }

    /** Return the media query used for orientation blocking. @returns {string} */
    getBlockQuery() {
        return '(pointer: coarse) and (orientation: portrait)';
    }

    /** Return the maximum allowed long viewport edge. @returns {number} */
    getHubMaxLong() {
        return 1280;
    }

    /** Return the maximum allowed short viewport edge. @returns {number} */
    getHubMaxShort() {
        return 800;
    }

    /** Return whether viewport size is within hub max bounds. @returns {boolean} */
    isWithinHubMax() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        return Math.max(w, h) <= this.getHubMaxLong() && Math.min(w, h) <= this.getHubMaxShort();
    }

    /** Initialize orientation toggle UI and blocker. */
    initToggle() {
        this.initBlocker();
        this.toggleButton = document.getElementById('orientation-toggle');
        if (!this.toggleButton) return;
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
    }

    /** Advance to the next orientation mode. */
    handleClick() {
        let current = this.getStoredMode();
        let next = this.getNextMode(current);
        localStorage.setItem(this.getStorageKey(), next);
        this.applyLayout();
    }

    /** Return the stored orientation mode. @returns {string} */
    getStoredMode() {
        return localStorage.getItem(this.getStorageKey()) || 'auto';
    }

    /** Return the next orientation mode in sequence. @param {string} current @returns {string} */
    getNextMode(current) {
        let modes = this.getModes();
        let index = modes.indexOf(current);
        if (index === -1) return modes[0];
        return modes[(index + 1) % modes.length];
    }

    /** Apply the currently stored orientation mode. */
    applyStored() {
        this.applyLayout(this.getStoredMode());
    }

    /** Apply orientation mode and transform layout. @param {string=} forcedMode */
    applyLayout(forcedMode) {
        let canvas = this.deps.getCanvas();
        let target = this.deps.getTarget();
        let mode = this.resolveMode(forcedMode);
        if (!canvas || !target) return;
        this.applyModeClass(mode);
        this.deps.resizeCanvas();
        this.deps.applyContainBaseStyles();
        this.applyTransform(target);
    }

    /** Resolve a valid orientation mode. @param {string=} forcedMode @returns {string} */
    resolveMode(forcedMode) {
        let stored = forcedMode || this.getStoredMode();
        let modes = this.getModes();
        return modes.indexOf(stored) !== -1 ? stored : 'auto';
    }

    /** Apply orientation CSS classes and label text. @param {string} mode */
    applyModeClass(mode) {
        document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
        document.body.classList.add('orientation-' + mode);
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        this.updateButtonLabel(mode);
    }

    /** Update orientation toggle label text. @param {string} mode */
    updateButtonLabel(mode) {
        let labels = { auto: 'Auto', portrait: 'Hochformat', landscape: 'Querformat' };
        if (!this.toggleButton) return;
        this.toggleButton.textContent = 'Ausrichtung: ' + (labels[mode] || 'Auto');
    }

    /** Apply transform scaling to the orientation target. @param {HTMLElement} target */
    applyTransform(target) {
        let scales = this.computeScalePair(0);
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.transform = 'translate(-50%, -50%) scale(' + scales.x + ', ' + scales.y + ')';
    }

    /** Compute uniform scale for a rotation angle. @param {number} rotation @returns {number} */
    computeScale(rotation) {
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        let normalized = ((rotation % 360) + 360) % 360;
        let rotated = normalized === 90 || normalized === 270;
        let baseW = rotated ? h : w;
        let baseH = rotated ? w : h;
        return Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    }

    /** Compute x/y scale pair for a rotation angle. @param {number} rotation @returns {{x:number,y:number}} */
    computeScalePair(rotation) {
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        let n = ((rotation % 360) + 360) % 360;
        let rot = n === 90 || n === 270;
        let vw = window.innerWidth;
        let vh = window.innerHeight;
        let sx = rot ? vh / w : vw / w;
        let sy = rot ? vw / h : vh / h;
        let baseW = rot ? h : w;
        let baseH = rot ? w : h;
        let factor = 0.85;
        let baseLong = Math.max(baseW, baseH);
        let baseShort = Math.min(baseW, baseH);
        let cap = Math.min(this.getHubMaxLong() / baseLong, this.getHubMaxShort() / baseShort) * factor;
        let s = Math.min(vw / baseW, vh / baseH) * factor;
        if (document.fullscreenElement) return { x: sx, y: sy };
        if (s > cap) s = cap;
        return { x: s, y: s };
    }

    /** Initialize the portrait-orientation blocker listener. */
    initBlocker() {
        window.__epl_install_interval_guard();
        if (!window.matchMedia) {
            this.applyBlockState(false);
            return;
        }
        this.blockMql = window.matchMedia(this.getBlockQuery());
        this.blockHandler = this.handleBlockChange.bind(this);
        if (this.blockMql.addEventListener) this.blockMql.addEventListener('change', this.blockHandler);
        else if (this.blockMql.addListener) this.blockMql.addListener(this.blockHandler);
        this.handleBlockChange();
    }

    /** Re-evaluate and apply orientation block state. */
    handleBlockChange() {
        let blocked = Boolean(this.blockMql && this.blockMql.matches) && this.isWithinHubMax();
        this.applyBlockState(blocked);
    }

    /** Apply blocker CSS and broadcast block state. @param {boolean} blocked */
    applyBlockState(blocked) {
        document.body.classList.toggle('epl-orientation-blocked', blocked);
        this.updateBlockAria(blocked);
        window.dispatchEvent(new CustomEvent('epl:orientation-blocked', { detail: { blocked: blocked } }));
    }

    /** Update blocker accessibility attributes. @param {boolean} blocked */
    updateBlockAria(blocked) {
        let block = document.getElementById('orientation-block');
        if (!block) return;
        block.style.display = blocked ? 'flex' : 'none';
        block.setAttribute('aria-hidden', blocked ? 'false' : 'true');
    }
};
