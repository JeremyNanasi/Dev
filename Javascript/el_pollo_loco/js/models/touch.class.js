/**
 * @fileoverview
 * Touch controller that maps touch UI interactions to the shared `Keyboard` input state for mobile gameplay.
 *
 * Exposed under `window.EPL.Controllers.Touch`.
 */
window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};
window.EPL.Controllers.Touch = window.EPL.Controllers.Touch || class TouchController {
    /**
     * Initializes a new methods instance and sets up default runtime state.
     * The constructor prepares dependencies used by class behavior.
     * @param {object} deps - Object argument used by this routine.
     */
    constructor(deps) {
        this.deps = deps;
        this.initialized = false;
        this.visible = false;
        this.mql = null;
        this.keyToButton = new Map();
        this.mousePressedKeys = new Set();
    }

    /**
     * Returns the storage key.
     * This helper centralizes read access for callers.
     * @returns {string} Returns the resulting string value.
     */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.TOUCH_CONTROLS ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
    }

    /**
     * Returns the breakpoint.
     * This helper centralizes read access for callers.
     * @returns {number} Returns the computed numeric value.
     */
    getBreakpoint() {
        return window.EPL && typeof window.EPL.BREAKPOINT_MOBILE === 'number' ? window.EPL.BREAKPOINT_MOBILE : 899;
    }

    /**
     * Initializes once.
     * It is part of the module startup flow.
     */
    initOnce() {
        let buttons;
        if (this.initialized) return;
        buttons = Array.from(document.querySelectorAll('.touch-control-button'));
        if (!buttons.length) return;
        this.bindButtons(buttons);
        this.bindGlobalMouseUp();
        this.initialized = true;
    }

    /**
     * Binds buttons.
     * The operation is isolated here to keep behavior predictable.
     * @param {Array<unknown>} buttons - Array argument consumed by this routine.
     */
    bindButtons(buttons) {
        let self = this;
        buttons.forEach(function(btn) {
            let key = btn.dataset.key;
            if (!key) return;
            self.keyToButton.set(key, btn);
            self.attachButtonListeners(btn, key);
        });
    }

    /**
     * Attaches button listeners.
     * The operation is isolated here to keep behavior predictable.
     * @param {object} btn - Object argument used by this routine.
     * @param {unknown} key - Input value used by this routine.
     */
    attachButtonListeners(btn, key) {
        let self = this;
        /**
         * Handles start.
         * It applies side effects required by this branch.
         * @param {Event} e - Input value used by this routine.
         * @param {string} src - String value used by this routine.
         */
        let onStart = function(e, src) { self.handlePressStart(e, src, btn, key); };
        /**
         * Handles end.
         * It applies side effects required by this branch.
         * @param {Event} e - Input value used by this routine.
         */
        let onEnd = function(e) { self.handlePressEnd(e, btn, key); };
        btn.addEventListener('touchstart', function(e) { onStart(e, 'touch'); }, { passive: false });
        btn.addEventListener('touchend', onEnd, { passive: false });
        btn.addEventListener('touchcancel', onEnd, { passive: false });
        btn.addEventListener('mousedown', function(e) { onStart(e, 'mouse'); });
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', onEnd);
    }

    /**
     * Handles press start.
     * It applies side effects required by this branch.
     * @param {Event} e - Input value used by this routine.
     * @param {string} src - String value used by this routine.
     * @param {object} btn - Object argument used by this routine.
     * @param {unknown} key - Input value used by this routine.
     */
    handlePressStart(e, src, btn, key) {
        let kb = this.deps.getKeyboard();
        let keys;
        if (this.deps.shouldIgnoreInput() || !kb) return;
        e.preventDefault();
        keys = this.getKeysForButton(key);
        keys.forEach(function(k) { kb[k] = true; });
        btn.classList.add('is-pressed');
        if (src === 'mouse') this.mousePressedKeys.add(key);
    }

    /**
     * Handles press end.
     * It applies side effects required by this branch.
     * @param {Event} e - Input value used by this routine.
     * @param {object} btn - Object argument used by this routine.
     * @param {unknown} key - Input value used by this routine.
     */
    handlePressEnd(e, btn, key) {
        let kb = this.deps.getKeyboard();
        let keys = this.getKeysForButton(key);
        let isJump = keys.indexOf('SPACE') !== -1 || keys.indexOf('UP') !== -1;
        if (e && e.preventDefault) e.preventDefault();
        if (!kb) return;
        if (isJump) setTimeout(function() { keys.forEach(function(k) { kb[k] = false; }); }, 120);
        else keys.forEach(function(k) { kb[k] = false; });
        btn.classList.remove('is-pressed');
        this.mousePressedKeys.delete(key);
    }

    /**
     * Returns the keys for button.
     * This helper centralizes read access for callers.
     * @param {string} key - String value used by this routine.
     * @returns {Array<unknown>} Returns the assembled array for downstream processing.
     */
    getKeysForButton(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    }

    /**
     * Binds global mouse up.
     * The operation is isolated here to keep behavior predictable.
     */
    bindGlobalMouseUp() {
        let self = this;
        window.addEventListener('mouseup', function(e) {
            if (!self.mousePressedKeys.size) return;
            if (e && e.preventDefault) e.preventDefault();
            self.releaseAllMouseKeys();
        });
    }

    /**
     * Executes the release all mouse keys routine.
     * The logic is centralized here for maintainability.
     */
    releaseAllMouseKeys() {
        let self = this;
        let kb = this.deps.getKeyboard();
        if (!kb) return;
        this.mousePressedKeys.forEach(function(key) {
            let keys = self.getKeysForButton(key);
            let btn = self.keyToButton.get(key);
            keys.forEach(function(k) { kb[k] = false; });
            if (btn) btn.classList.remove('is-pressed');
        });
        this.mousePressedKeys.clear();
    }

    /**
     * Initializes media query.
     * It is part of the module startup flow.
     */
    setupMediaQuery() {
        let self = this;
        if (!window.matchMedia) return;
        this.mql = window.matchMedia('(max-width: ' + this.getBreakpoint() + 'px)');
        if (this.mql.addEventListener) this.mql.addEventListener('change', function() { self.updateVisibility(); });
        else if (this.mql.addListener) this.mql.addListener(function() { self.updateVisibility(); });
    }

    /**
     * Initializes mobile toggle.
     * It is part of the module startup flow.
     */
    setupMobileToggle() {
        let self = this;
        let toggle = document.getElementById('mobile-controls-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function() {
            self.visible = !self.visible;
            localStorage.setItem(self.getStorageKey(), self.visible ? 'on' : 'off');
            self.updateUI();
        });
    }

    /**
     * Updates visibility.
     * This synchronizes runtime state with current inputs.
     */
    updateVisibility() {
        let stored = localStorage.getItem(this.getStorageKey());
        let isTouch = document.body.classList.contains('is-mobile-tablet');
        this.visible = this.resolveVisibility(stored, isTouch);
        this.updateUI();
    }

    /**
     * Resolves visibility.
     * The operation is isolated here to keep behavior predictable.
     * @param {string} stored - String value used by this routine.
     * @param {boolean} isTouch - Boolean flag controlling this branch.
     * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
     */
    resolveVisibility(stored, isTouch) {
        if (stored === 'on') return true;
        if (stored === 'off') return false;
        return Boolean(isTouch);
    }

    /**
     * Updates UI.
     * This synchronizes runtime state with current inputs.
     */
    updateUI() {
        let controls = document.getElementById('touch-controls');
        let toggle = document.getElementById('mobile-controls-toggle');
        let show = Boolean(this.visible);
        if (controls) controls.classList.toggle('is-visible', show);
        document.body.classList.toggle('touch-controls-visible', show);
        document.body.classList.toggle('touch-controls-hidden', !show);
        this.updateToggleText(toggle, show);
        this.updateOrientationToggle(show);
    }

    /**
     * Updates toggle text.
     * This synchronizes runtime state with current inputs.
     * @param {object} toggle - Object argument used by this routine.
     * @param {boolean} show - Boolean flag controlling this branch.
     */
    updateToggleText(toggle, show) {
        if (toggle) toggle.textContent = show ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }

    /**
     * Updates orientation toggle.
     * This synchronizes runtime state with current inputs.
     * @param {boolean} show - Boolean flag controlling this branch.
     */
    updateOrientationToggle(show) {
        let btn = document.getElementById('orientation-toggle');
        let withinBp = this.mql ? this.mql.matches : window.innerWidth <= this.getBreakpoint();
        if (!btn) return;
        btn.style.display = (show || withinBp) ? 'inline-flex' : 'none';
    }

    /**
     * Executes the detect mobile tablet routine.
     * The logic is centralized here for maintainability.
     * @returns {unknown} Returns the value produced by this routine.
     */
    detectMobileTablet() {
        let touch = navigator.maxTouchPoints > 0;
        let coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        let noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        return touch && (coarse || noHover);
    }

    /**
     * Updates mobile tablet state.
     * This synchronizes runtime state with current inputs.
     * @returns {unknown} Returns the value produced by this routine.
     */
    updateMobileTabletState() {
        let detected = this.detectMobileTablet();
        document.body.classList.toggle('is-mobile-tablet', detected);
        return detected;
    }
};
