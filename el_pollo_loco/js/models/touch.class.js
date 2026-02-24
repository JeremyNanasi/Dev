window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.Touch = window.EPL.Controllers.Touch || class TouchController {
    /** Initialize touch controller dependencies. @param {{getKeyboard:Function,shouldIgnoreInput:Function}} deps */
    constructor(deps) {
        this.deps = deps;
        this.initialized = false;
        this.visible = false;
        this.mql = null;
        this.keyToButton = new Map();
        this.mousePressedKeys = new Set();
    }

    /** Return the storage key for touch-control preference. @returns {string} */
    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.TOUCH_CONTROLS ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
    }

    /** Return the mobile breakpoint width. @returns {number} */
    getBreakpoint() {
        return window.EPL && typeof window.EPL.BREAKPOINT_MOBILE === 'number' ? window.EPL.BREAKPOINT_MOBILE : 899;
    }

    /** Initialize touch buttons and mouse release hook once. */
    initOnce() {
        let buttons;
        if (this.initialized) return;
        buttons = Array.from(document.querySelectorAll('.touch-control-button'));
        if (!buttons.length) return;
        this.bindButtons(buttons);
        this.bindGlobalMouseUp();
        this.initialized = true;
    }

    /** Bind handlers for all touch control buttons. @param {HTMLElement[]} buttons */
    bindButtons(buttons) {
        let self = this;
        buttons.forEach(function(btn) {
            let key = btn.dataset.key;
            if (!key) return;
            self.keyToButton.set(key, btn);
            self.attachButtonListeners(btn, key);
        });
    }

    /** Attach pointer listeners for one control button. @param {HTMLElement} btn @param {string} key */
    attachButtonListeners(btn, key) {
        let self = this;
        /** Handle press-start events for this button binding. @param {Event} e @param {string} src */
        let onStart = function(e, src) { self.handlePressStart(e, src, btn, key); };
        /** Handle press-end events for this button binding. @param {Event} e */
        let onEnd = function(e) { self.handlePressEnd(e, btn, key); };
        btn.addEventListener('touchstart', function(e) { onStart(e, 'touch'); }, { passive: false });
        btn.addEventListener('touchend', onEnd, { passive: false });
        btn.addEventListener('touchcancel', onEnd, { passive: false });
        btn.addEventListener('mousedown', function(e) { onStart(e, 'mouse'); });
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', onEnd);
    }

    /** Apply key-down state for button press start. @param {Event} e @param {string} src @param {HTMLElement} btn @param {string} key */
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

    /** Apply key-up state for button press end. @param {Event} e @param {HTMLElement} btn @param {string} key */
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

    /** Return keyboard keys mapped to a touch button key. @param {string} key @returns {string[]} */
    getKeysForButton(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    }

    /** Bind global mouseup to release active mouse-pressed keys. */
    bindGlobalMouseUp() {
        let self = this;
        window.addEventListener('mouseup', function(e) {
            if (!self.mousePressedKeys.size) return;
            if (e && e.preventDefault) e.preventDefault();
            self.releaseAllMouseKeys();
        });
    }

    /** Release all keys currently held by mouse interaction. */
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

    /** Set up viewport media-query listener for controls visibility. */
    setupMediaQuery() {
        let self = this;
        if (!window.matchMedia) return;
        this.mql = window.matchMedia('(max-width: ' + this.getBreakpoint() + 'px)');
        if (this.mql.addEventListener) this.mql.addEventListener('change', function() { self.updateVisibility(); });
        else if (this.mql.addListener) this.mql.addListener(function() { self.updateVisibility(); });
    }

    /** Set up the mobile controls toggle button listener. */
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

    /** Recompute controls visibility from storage and device state. */
    updateVisibility() {
        let stored = localStorage.getItem(this.getStorageKey());
        let isTouch = document.body.classList.contains('is-mobile-tablet');
        this.visible = this.resolveVisibility(stored, isTouch);
        this.updateUI();
    }

    /** Resolve controls visibility from preference and device state. @param {string|null} stored @param {boolean} isTouch @returns {boolean} */
    resolveVisibility(stored, isTouch) {
        if (stored === 'on') return true;
        if (stored === 'off') return false;
        return Boolean(isTouch);
    }

    /** Update controls and related toggle UI classes. */
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

    /** Update toggle button text for current visibility. @param {HTMLElement|null} toggle @param {boolean} show */
    updateToggleText(toggle, show) {
        if (toggle) toggle.textContent = show ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }

    /** Update orientation toggle visibility based on touch controls state. @param {boolean} show */
    updateOrientationToggle(show) {
        let btn = document.getElementById('orientation-toggle');
        let withinBp = this.mql ? this.mql.matches : window.innerWidth <= this.getBreakpoint();
        if (!btn) return;
        btn.style.display = (show || withinBp) ? 'inline-flex' : 'none';
    }

    /** Detect whether device characteristics match mobile/tablet. @returns {boolean} */
    detectMobileTablet() {
        let touch = navigator.maxTouchPoints > 0;
        let coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        let noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        return touch && (coarse || noHover);
    }

    /** Update and return mobile/tablet body class state. @returns {boolean} */
    updateMobileTabletState() {
        let detected = this.detectMobileTablet();
        document.body.classList.toggle('is-mobile-tablet', detected);
        return detected;
    }
};
