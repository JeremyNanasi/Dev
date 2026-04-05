window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

/**
 * Executes the __epl_wrap_interval_callback routine.
 * The logic is centralized here for maintainability.
 * @param {Function} cb - Callback function executed by this helper.
 * @returns {unknown} Returns the value produced by this routine.
 */
window.__epl_wrap_interval_callback = window.__epl_wrap_interval_callback || function(cb) {
    return function() {
        if (document.body && document.body.classList.contains('epl-orientation-blocked')) return;
        return cb.apply(this, arguments);
    };
};

/**
 * Executes the __epl_install_interval_guard routine.
 * The logic is centralized here for maintainability.
 */
window.__epl_install_interval_guard = window.__epl_install_interval_guard || function() {
    if (window.__epl_interval_guarded) return;
    window.__epl_original_set_interval = window.__epl_original_set_interval || window.setInterval;

    /**
     * Sets the interval.
     * This keeps persistent and in-memory state aligned.
     * @param {Function} cb - Callback function executed by this helper.
     * @param {number} delay - Delay value in milliseconds.
     * @returns {unknown} Returns the value produced by this routine.
     */
    window.setInterval = function(cb, delay) {
        if (typeof cb !== 'function') return window.__epl_original_set_interval(cb, delay);
        return window.__epl_original_set_interval(window.__epl_wrap_interval_callback(cb), delay);
    };

    window.__epl_interval_guarded = true;
};

window.EPL.Controllers.Orientation = window.EPL.Controllers.Orientation || class OrientationController {
    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {object} deps - Object argument used by this routine.
     */
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
        this.blockMql = null;
        this.blockHandler = null;
    }

    /**
     * Returns the storage key.
     * This helper centralizes read access for callers.
     * @returns {string} Returns the resulting string value.
     */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.ORIENTATION_MODE ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    }

    /**
     * Returns the modes.
     * This helper centralizes read access for callers.
     * @returns {unknown} Returns the value produced by this routine.
     */
    getModes() {
        let modes = window.EPL && Array.isArray(window.EPL.ORIENTATION_MODES) ? window.EPL.ORIENTATION_MODES : null;
        return modes && modes.length ? modes : ['auto', 'portrait', 'landscape'];
    }

    /**
     * Returns the block query.
     * This helper centralizes read access for callers.
     * @returns {string} Returns the resulting string value.
     */
    getBlockQuery() {
        return '(pointer: coarse) and (orientation: portrait)';
    }

    /**
     * Returns the hub max long.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHubMaxLong() {
        return 1280;
    }

    /**
     * Returns the hub max short.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getHubMaxShort() {
        return 800;
    }

    /**
     * Evaluates the within hub max condition.
     * Returns whether the current runtime state satisfies that condition.
     * @returns {number} Returns the computed numeric value.
     */
    isWithinHubMax() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        return Math.max(w, h) <= this.getHubMaxLong() && Math.min(w, h) <= this.getHubMaxShort();
    }

    /**
     * Initializes toggle.
     * It is part of the module startup flow.
     */
    initToggle() {
        this.initBlocker();
        this.toggleButton = document.getElementById('orientation-toggle');
        if (!this.toggleButton) return;
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
    }

    /**
     * Handles click.
     * It applies side effects required by this branch.
     */
    handleClick() {
        let current = this.getStoredMode();
        let next = this.getNextMode(current);
        localStorage.setItem(this.getStorageKey(), next);
        this.applyLayout();
    }

    /**
     * Returns the stored mode.
     * This helper centralizes read access for callers.
     * @returns {string} Returns the resulting string value.
     */
    getStoredMode() {
        return localStorage.getItem(this.getStorageKey()) || 'auto';
    }

    /**
     * Returns the next mode.
     * This helper centralizes read access for callers.
     * @param {unknown} current - Input value used by this routine.
     * @returns {string} Returns the resulting string value.
     */
    getNextMode(current) {
        let modes = this.getModes();
        let index = modes.indexOf(current);
        if (index === -1) return modes[0];
        return modes[(index + 1) % modes.length];
    }

    /**
     * Applies stored.
     * The operation is isolated here to keep behavior predictable.
     */
    applyStored() {
        this.applyLayout(this.getStoredMode());
    }

    /**
     * Applies layout.
     * The operation is isolated here to keep behavior predictable.
     * @param {unknown} forcedMode - Input value used by this routine.
     */
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

    /**
     * Resolves mode.
     * The operation is isolated here to keep behavior predictable.
     * @param {unknown} forcedMode - Input value used by this routine.
     * @returns {string} Returns the resulting string value.
     */
    resolveMode(forcedMode) {
        let stored = forcedMode || this.getStoredMode();
        let modes = this.getModes();
        return modes.indexOf(stored) !== -1 ? stored : 'auto';
    }

    /**
     * Applies mode class.
     * The operation is isolated here to keep behavior predictable.
     * @param {string} mode - String value used by this routine.
     */
    applyModeClass(mode) {
        document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
        document.body.classList.add('orientation-' + mode);
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        this.updateButtonLabel(mode);
    }

    /**
     * Updates button label.
     * This synchronizes runtime state with current inputs.
     * @param {string} mode - String value used by this routine.
     */
    updateButtonLabel(mode) {
        let labels = { auto: 'Auto', portrait: 'Hochformat', landscape: 'Querformat' };
        if (!this.toggleButton) return;
        this.toggleButton.textContent = 'Ausrichtung: ' + (labels[mode] || 'Auto');
    }

    /**
     * Applies transform.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} target - Object argument used by this routine.
     */
    applyTransform(target) {
        let scales = this.computeScalePair(0);
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.transform = 'translate(-50%, -50%) scale(' + scales.x + ', ' + scales.y + ')';
    }

    /**
     * Computes scale.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} rotation - Numeric value used by this routine.
     * @returns {number} Returns the computed numeric value.
     */
    computeScale(rotation) {
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        let normalized = ((rotation % 360) + 360) % 360;
        let rotated = normalized === 90 || normalized === 270;
        let baseW = rotated ? h : w;
        let baseH = rotated ? w : h;
        return Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    }

    /**
     * Computes scale pair.
     * The operation is isolated here to keep behavior predictable.
     * @param {number} rotation - Numeric value used by this routine.
     * @returns {object} Returns an object containing computed state values.
     */
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

    /**
     * Initializes blocker.
     * It is part of the module startup flow.
     */
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

    /**
     * Handles block change.
     * It applies side effects required by this branch.
     */
    handleBlockChange() {
        let blocked = Boolean(this.blockMql && this.blockMql.matches) && this.isWithinHubMax();
        this.applyBlockState(blocked);
    }

    /**
     * Applies block state.
     * The operation is isolated here to keep behavior predictable.
     * @param {boolean} blocked - Boolean flag controlling this branch.
     */
    applyBlockState(blocked) {
        document.body.classList.toggle('epl-orientation-blocked', blocked);
        this.updateBlockAria(blocked);
        window.dispatchEvent(new CustomEvent('epl:orientation-blocked', { detail: { blocked: blocked } }));
    }

    /**
     * Updates block aria.
     * This synchronizes runtime state with current inputs.
     * @param {boolean} blocked - Boolean flag controlling this branch.
     */
    updateBlockAria(blocked) {
        let block = document.getElementById('orientation-block');
        if (!block) return;
        block.style.display = blocked ? 'flex' : 'none';
        block.setAttribute('aria-hidden', blocked ? 'false' : 'true');
    }
};
