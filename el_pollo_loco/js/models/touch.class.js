window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.Touch = window.EPL.Controllers.Touch || class TouchController {
    constructor(deps) {
        this.deps = deps;
        this.initialized = false;
        this.visible = false;
        this.mql = null;
        this.keyToButton = new Map();
        this.mousePressedKeys = new Set();
    }

    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.TOUCH_CONTROLS ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
    }

    getBreakpoint() {
        return window.EPL && typeof window.EPL.BREAKPOINT_MOBILE === 'number' ? window.EPL.BREAKPOINT_MOBILE : 899;
    }

    initOnce() {
        var buttons;
        if (this.initialized) return;
        buttons = Array.from(document.querySelectorAll('.touch-control-button'));
        if (!buttons.length) return;
        this.bindButtons(buttons);
        this.bindGlobalMouseUp();
        this.initialized = true;
    }

    bindButtons(buttons) {
        var self = this;
        buttons.forEach(function(btn) {
            var key = btn.dataset.key;
            if (!key) return;
            self.keyToButton.set(key, btn);
            self.attachButtonListeners(btn, key);
        });
    }

    attachButtonListeners(btn, key) {
        var self = this;
        var onStart = function(e, src) { self.handlePressStart(e, src, btn, key); };
        var onEnd = function(e) { self.handlePressEnd(e, btn, key); };
        btn.addEventListener('touchstart', function(e) { onStart(e, 'touch'); }, { passive: false });
        btn.addEventListener('touchend', onEnd, { passive: false });
        btn.addEventListener('touchcancel', onEnd, { passive: false });
        btn.addEventListener('mousedown', function(e) { onStart(e, 'mouse'); });
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', onEnd);
    }

    handlePressStart(e, src, btn, key) {
        var kb = this.deps.getKeyboard();
        var keys;
        if (this.deps.shouldIgnoreInput() || !kb) return;
        e.preventDefault();
        keys = this.getKeysForButton(key);
        keys.forEach(function(k) { kb[k] = true; });
        btn.classList.add('is-pressed');
        if (src === 'mouse') this.mousePressedKeys.add(key);
    }

    handlePressEnd(e, btn, key) {
        var kb = this.deps.getKeyboard();
        var keys = this.getKeysForButton(key);
        var isJump = keys.indexOf('SPACE') !== -1 || keys.indexOf('UP') !== -1;
        if (e && e.preventDefault) e.preventDefault();
        if (!kb) return;
        if (isJump) setTimeout(function() { keys.forEach(function(k) { kb[k] = false; }); }, 120);
        else keys.forEach(function(k) { kb[k] = false; });
        btn.classList.remove('is-pressed');
        this.mousePressedKeys.delete(key);
    }

    getKeysForButton(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    }

    bindGlobalMouseUp() {
        var self = this;
        window.addEventListener('mouseup', function(e) {
            if (!self.mousePressedKeys.size) return;
            if (e && e.preventDefault) e.preventDefault();
            self.releaseAllMouseKeys();
        });
    }

    releaseAllMouseKeys() {
        var self = this;
        var kb = this.deps.getKeyboard();
        if (!kb) return;
        this.mousePressedKeys.forEach(function(key) {
            var keys = self.getKeysForButton(key);
            var btn = self.keyToButton.get(key);
            keys.forEach(function(k) { kb[k] = false; });
            if (btn) btn.classList.remove('is-pressed');
        });
        this.mousePressedKeys.clear();
    }

    setupMediaQuery() {
        var self = this;
        if (!window.matchMedia) return;
        this.mql = window.matchMedia('(max-width: ' + this.getBreakpoint() + 'px)');
        if (this.mql.addEventListener) this.mql.addEventListener('change', function() { self.updateVisibility(); });
        else if (this.mql.addListener) this.mql.addListener(function() { self.updateVisibility(); });
    }

    setupMobileToggle() {
        var self = this;
        var toggle = document.getElementById('mobile-controls-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function() {
            self.visible = !self.visible;
            localStorage.setItem(self.getStorageKey(), self.visible ? 'on' : 'off');
            self.updateUI();
        });
    }

    updateVisibility() {
        var stored = localStorage.getItem(this.getStorageKey());
        var isTouch = document.body.classList.contains('is-mobile-tablet');
        this.visible = this.resolveVisibility(stored, isTouch);
        this.updateUI();
    }

    resolveVisibility(stored, isTouch) {
        if (stored === 'on') return true;
        if (stored === 'off') return false;
        return Boolean(isTouch);
    }

    updateUI() {
        var controls = document.getElementById('touch-controls');
        var toggle = document.getElementById('mobile-controls-toggle');
        var show = Boolean(this.visible);
        if (controls) controls.classList.toggle('is-visible', show);
        document.body.classList.toggle('touch-controls-visible', show);
        document.body.classList.toggle('touch-controls-hidden', !show);
        this.updateToggleText(toggle, show);
        this.updateOrientationToggle(show);
    }

    updateToggleText(toggle, show) {
        if (toggle) toggle.textContent = show ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }

    updateOrientationToggle(show) {
        var btn = document.getElementById('orientation-toggle');
        var withinBp = this.mql ? this.mql.matches : window.innerWidth <= this.getBreakpoint();
        if (!btn) return;
        btn.style.display = (show || withinBp) ? 'inline-flex' : 'none';
    }

    detectMobileTablet() {
        var touch = navigator.maxTouchPoints > 0;
        var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        var noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        return touch && (coarse || noHover);
    }

    updateMobileTabletState() {
        var detected = this.detectMobileTablet();
        document.body.classList.toggle('is-mobile-tablet', detected);
        return detected;
    }
};
