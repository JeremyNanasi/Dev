(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Touch) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    var STORAGE_KEY = 'touch-controls-preference';
    var BREAKPOINT = 899;

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
        var buttons = Array.from(document.querySelectorAll('.touch-control-button'));
        if (!buttons.length) return;
        this.bindButtons(buttons);
        this.bindGlobalMouseUp();
        this.initialized = true;
    };

    TouchController.prototype.bindButtons = function(buttons) {
        var self = this;
        buttons.forEach(function(btn) {
            var key = btn.dataset.key;
            if (!key) return;
            self.keyToButton.set(key, btn);
            self.attachButtonListeners(btn, key);
        });
    };

    TouchController.prototype.attachButtonListeners = function(btn, key) {
        var self = this;
        var onStart = function(e, src) { self.handlePressStart(e, src, btn, key); };
        var onEnd = function(e) { self.handlePressEnd(e, btn, key); };
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
        var keys = this.getKeysForButton(key);
        var kb = this.deps.getKeyboard();
        keys.forEach(function(k) { kb[k] = true; });
        btn.classList.add('is-pressed');
        if (src === 'mouse') this.mousePressedKeys.add(key);
    };

    TouchController.prototype.handlePressEnd = function(e, btn, key) {
        e.preventDefault();
        var keys = this.getKeysForButton(key);
        var kb = this.deps.getKeyboard();
        var isJump = keys.includes('SPACE') || keys.includes('UP');
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
        var self = this;
        window.addEventListener('mouseup', function(e) {
            if (!self.mousePressedKeys.size) return;
            e.preventDefault();
            self.releaseAllMouseKeys();
        });
    };

    TouchController.prototype.releaseAllMouseKeys = function() {
        var self = this;
        var kb = this.deps.getKeyboard();
        this.mousePressedKeys.forEach(function(key) {
            var keys = self.getKeysForButton(key);
            keys.forEach(function(k) { kb[k] = false; });
            var btn = self.keyToButton.get(key);
            if (btn) btn.classList.remove('is-pressed');
        });
        this.mousePressedKeys.clear();
    };

    TouchController.prototype.setupMediaQuery = function() {
        if (!window.matchMedia) return;
        var self = this;
        this.mql = window.matchMedia('(max-width: ' + BREAKPOINT + 'px)');
        this.mql.addEventListener('change', function() { self.updateVisibility(); });
    };

    TouchController.prototype.setupMobileToggle = function() {
        var toggle = document.getElementById('mobile-controls-toggle');
        if (!toggle) return;
        var self = this;
        toggle.addEventListener('click', function() {
            self.visible = !self.visible;
            localStorage.setItem(STORAGE_KEY, self.visible ? 'on' : 'off');
            self.updateUI();
        });
    };

    TouchController.prototype.updateVisibility = function() {
        var stored = localStorage.getItem(STORAGE_KEY);
        var isMobile = document.body.classList.contains('is-mobile-tablet');
        var withinBp = this.mql ? this.mql.matches : window.innerWidth <= BREAKPOINT;
        this.visible = this.resolveVisibility(stored, isMobile, withinBp);
        this.updateUI();
    };

    TouchController.prototype.resolveVisibility = function(stored, isMobile, withinBp) {
        if (stored === 'on') return true;
        if (stored === 'off') return false;
        if (!isMobile || !withinBp) return false;
        return isMobile && withinBp;
    };

    TouchController.prototype.updateUI = function() {
        var controls = document.getElementById('touch-controls');
        var toggle = document.getElementById('mobile-controls-toggle');
        var show = Boolean(this.visible);
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
        var btn = document.getElementById('orientation-toggle');
        if (!btn) return;
        var withinBp = this.mql ? this.mql.matches : window.innerWidth <= BREAKPOINT;
        btn.style.display = (show || withinBp) ? 'inline-flex' : 'none';
    };

    TouchController.prototype.detectMobileTablet = function() {
        var touch = navigator.maxTouchPoints > 0;
        var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        var noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
        return touch || (coarse && noHover);
    };

    TouchController.prototype.updateMobileTabletState = function() {
        var detected = this.detectMobileTablet();
        document.body.classList.toggle('is-mobile-tablet', detected);
        return detected;
    };

    window.EPL.Controllers.Touch = TouchController;
})();
