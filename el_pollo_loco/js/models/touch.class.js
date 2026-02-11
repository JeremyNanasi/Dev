(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Touch) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let STORAGE_KEY = 'touch-controls-preference';
    let BREAKPOINT = 899;

    function TouchController(deps) {
        this.deps = deps;
        this.initialized = false;
        this.visible = false;
        this.mql = null;
        this.keyToButton = new Map();
        this.mousePressedKeys = new Set();
    }

    TouchController.prototype.initOnce = function() {
        if (this.initialized) return;
        let buttons = Array.from(document.querySelectorAll('.touch-control-button'));
        if (!buttons.length) return;
        this.bindButtons(buttons);
        this.bindGlobalMouseUp();
        this.initialized = true;
    };

    TouchController.prototype.bindButtons = function(buttons) {
        let self = this;
        buttons.forEach(function(btn) {
            let key = btn.dataset.key;
            if (!key) return;
            self.keyToButton.set(key, btn);
            self.attachButtonListeners(btn, key);
        });
    };

    TouchController.prototype.attachButtonListeners = function(btn, key) {
        let self = this;
        let onStart = function(e, src) { self.handlePressStart(e, src, btn, key); };
        let onEnd = function(e) { self.handlePressEnd(e, btn, key); };
        btn.addEventListener('touchstart', function(e) { onStart(e, 'touch'); }, { passive: false });
        btn.addEventListener('touchend', onEnd, { passive: false });
        btn.addEventListener('touchcancel', onEnd, { passive: false });
        btn.addEventListener('mousedown', function(e) { onStart(e, 'mouse'); });
        btn.addEventListener('mouseup', onEnd);
        btn.addEventListener('mouseleave', onEnd);
    };

    TouchController.prototype.handlePressStart = function(e, src, btn, key) {
        if (this.deps.shouldIgnoreInput()) return;
        e.preventDefault();
        let keys = this.getKeysForButton(key);
        let kb = this.deps.getKeyboard();
        keys.forEach(function(k) { kb[k] = true; });
        btn.classList.add('is-pressed');
        if (src === 'mouse') this.mousePressedKeys.add(key);
    };

    TouchController.prototype.handlePressEnd = function(e, btn, key) {
        e.preventDefault();
        let keys = this.getKeysForButton(key);
        let kb = this.deps.getKeyboard();
        let isJump = keys.includes('SPACE') || keys.includes('UP');
        if (isJump) {
            setTimeout(function() { keys.forEach(function(k) { kb[k] = false; }); }, 120);
        } else {
            keys.forEach(function(k) { kb[k] = false; });
        }
        btn.classList.remove('is-pressed');
        this.mousePressedKeys.delete(key);
    };

    TouchController.prototype.getKeysForButton = function(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    };

    TouchController.prototype.bindGlobalMouseUp = function() {
        let self = this;
        window.addEventListener('mouseup', function(e) {
            if (!self.mousePressedKeys.size) return;
            e.preventDefault();
            self.releaseAllMouseKeys();
        });
    };

    TouchController.prototype.releaseAllMouseKeys = function() {
        let self = this;
        let kb = this.deps.getKeyboard();
        this.mousePressedKeys.forEach(function(key) {
            let keys = self.getKeysForButton(key);
            keys.forEach(function(k) { kb[k] = false; });
            let btn = self.keyToButton.get(key);
            if (btn) btn.classList.remove('is-pressed');
        });
        this.mousePressedKeys.clear();
    };

    TouchController.prototype.setupMediaQuery = function() {
        if (!window.matchMedia) return;
        let self = this;
        this.mql = window.matchMedia('(max-width: ' + BREAKPOINT + 'px)');
        this.mql.addEventListener('change', function() { self.updateVisibility(); });
    };

    TouchController.prototype.setupMobileToggle = function() {
        let toggle = document.getElementById('mobile-controls-toggle');
        if (!toggle) return;
        let self = this;
        toggle.addEventListener('click', function() {
            self.visible = !self.visible;
            localStorage.setItem(STORAGE_KEY, self.visible ? 'on' : 'off');
            self.updateUI();
        });
    };

    TouchController.prototype.updateVisibility = function() {
        let stored = localStorage.getItem(STORAGE_KEY);
        let isTouch = document.body.classList.contains('is-mobile-tablet');
        this.visible = this.resolveVisibility(stored, isTouch);
        this.updateUI();
    };

    TouchController.prototype.resolveVisibility = function(stored, isTouch) {
        if (stored === 'on') return true;
        if (stored === 'off') return false;
        if (!isTouch) return false;
        return true;
    };

    TouchController.prototype.updateUI = function() {
        let controls = document.getElementById('touch-controls');
        let toggle = document.getElementById('mobile-controls-toggle');
        let show = Boolean(this.visible);
        if (controls) controls.classList.toggle('is-visible', show);
        document.body.classList.toggle('touch-controls-visible', show);
        document.body.classList.toggle('touch-controls-hidden', !show);
        this.updateToggleText(toggle, show);
        this.updateOrientationToggle(show);
    };

    TouchController.prototype.updateToggleText = function(toggle, show) {
        if (toggle) toggle.textContent = show ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    };

    TouchController.prototype.updateOrientationToggle = function(show) {
        let btn = document.getElementById('orientation-toggle');
        if (!btn) return;
        let withinBp = this.mql ? this.mql.matches : window.innerWidth <= BREAKPOINT;
        btn.style.display = (show || withinBp) ? 'inline-flex' : 'none';
    };

    TouchController.prototype.detectMobileTablet = function() {
        let touch = navigator.maxTouchPoints > 0;
        let coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        let noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        return touch && (coarse || noHover);
    };

    TouchController.prototype.updateMobileTabletState = function() {
        let detected = this.detectMobileTablet();
        document.body.classList.toggle('is-mobile-tablet', detected);
        return detected;
    };

    window.EPL.Controllers.Touch = TouchController;
})();
