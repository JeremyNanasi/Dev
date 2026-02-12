(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Orientation) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let MODES = ['auto', 'portrait', 'landscape'];
    let STORAGE_KEY = 'orientation-mode';
    let BLOCK_QUERY = '(pointer: coarse) and (orientation: portrait)';
    let HUB_MAX_LONG = 1280;
    let HUB_MAX_SHORT = 800;

    function isWithinHubMax() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        let longSide = Math.max(w, h);
        let shortSide = Math.min(w, h);
        return longSide <= HUB_MAX_LONG && shortSide <= HUB_MAX_SHORT;
    }

    function isBodyBlocked() {
        return document.body.classList.contains('epl-orientation-blocked');
    }

    function wrapIntervalCallback(cb) {
        return function() {
            if (isBodyBlocked()) return;
            return cb.apply(this, arguments);
        };
    }

    function installIntervalGuard() {
        if (window.__eplIntervalGuarded) return;
        let original = window.setInterval;
        window.setInterval = function(cb, delay) {
            if (typeof cb !== 'function') return original(cb, delay);
            return original(wrapIntervalCallback(cb), delay);
        };
        window.__eplIntervalGuarded = true;
    }

    function OrientationController(deps) {
        this.deps = deps;
        this.toggleButton = null;
        this.blockMql = null;
        this.blockHandler = null;
    }

    OrientationController.prototype.initToggle = function() {
        this.initBlocker();
        this.toggleButton = document.getElementById('orientation-toggle');
        if (!this.toggleButton) return;
        let self = this;
        this.toggleButton.addEventListener('click', function() { self.handleClick(); });
    };

    OrientationController.prototype.handleClick = function() {
        let current = this.getStoredMode();
        let next = this.getNextMode(current);
        localStorage.setItem(STORAGE_KEY, next);
        this.applyLayout();
    };

    OrientationController.prototype.getStoredMode = function() {
        return localStorage.getItem(STORAGE_KEY) || 'auto';
    };

    OrientationController.prototype.getNextMode = function(current) {
        let index = MODES.indexOf(current);
        if (index === -1) return MODES[0];
        return MODES[(index + 1) % MODES.length];
    };

    OrientationController.prototype.applyStored = function() {
        this.applyLayout(this.getStoredMode());
    };

    OrientationController.prototype.applyLayout = function(forcedMode) {
        let canvas = this.deps.getCanvas();
        let target = this.deps.getTarget();
        if (!canvas || !target) return;
        let mode = this.resolveMode(forcedMode);
        this.applyModeClass(mode);
        this.deps.resizeCanvas();
        this.deps.applyContainBaseStyles();
        this.applyTransform(target);
    };

    OrientationController.prototype.resolveMode = function(forcedMode) {
        let stored = forcedMode || this.getStoredMode();
        return MODES.includes(stored) ? stored : 'auto';
    };

    OrientationController.prototype.applyModeClass = function(mode) {
        document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
        document.body.classList.add('orientation-' + mode);
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        this.updateButtonLabel(mode);
    };

    OrientationController.prototype.updateButtonLabel = function(mode) {
        if (!this.toggleButton) return;
        let labels = { auto: 'Auto', portrait: 'Hochformat', landscape: 'Querformat' };
        this.toggleButton.textContent = 'Ausrichtung: ' + (labels[mode] || 'Auto');
    };

    OrientationController.prototype.applyTransform = function(target) {
        let scales = this.computeScalePair(0);
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.transform = 'translate(-50%, -50%) scale(' + scales.x + ', ' + scales.y + ')';
    };

    OrientationController.prototype.computeScale = function(rotation) {
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        let normalized = ((rotation % 360) + 360) % 360;
        let rotated = normalized === 90 || normalized === 270;
        let baseW = rotated ? h : w;
        let baseH = rotated ? w : h;
        return Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    };

    OrientationController.prototype.computeScalePair = function(rotation) {
        let w = this.deps.getCanvasWidth(), h = this.deps.getCanvasHeight();
        let n = ((rotation % 360) + 360) % 360, rot = n === 90 || n === 270;
        let vw = window.innerWidth, vh = window.innerHeight, factor = 0.85;
        let sx = rot ? (vh / w) : (vw / w);
        let sy = rot ? (vw / h) : (vh / h);
        if (document.fullscreenElement) return { x: sx, y: sy };
        let baseW = rot ? h : w, baseH = rot ? w : h;
        let baseLong = Math.max(baseW, baseH), baseShort = Math.min(baseW, baseH);
        let s = Math.min(vw / baseW, vh / baseH) * factor;
        let cap = Math.min(HUB_MAX_LONG / baseLong, HUB_MAX_SHORT / baseShort) * factor;
        if (s > cap) s = cap;
        return { x: s, y: s };
    };

    OrientationController.prototype.initBlocker = function() {
        installIntervalGuard();
        if (!window.matchMedia) return this.applyBlockState(false);
        this.blockMql = window.matchMedia(BLOCK_QUERY);
        let self = this;
        this.blockHandler = function() { self.handleBlockChange(); };
        if (this.blockMql.addEventListener) this.blockMql.addEventListener('change', this.blockHandler);
        else if (this.blockMql.addListener) this.blockMql.addListener(this.blockHandler);
        this.handleBlockChange();
    };

    OrientationController.prototype.handleBlockChange = function() {
        let blocked = Boolean(this.blockMql && this.blockMql.matches) && isWithinHubMax();
        this.applyBlockState(blocked);
    };

    OrientationController.prototype.applyBlockState = function(blocked) {
        document.body.classList.toggle('epl-orientation-blocked', blocked);
        this.updateBlockAria(blocked);
        window.dispatchEvent(new CustomEvent('epl:orientation-blocked', { detail: { blocked: blocked } }));
    };

    OrientationController.prototype.updateBlockAria = function(blocked) {
        let block = document.getElementById('orientation-block');
        if (!block) return;
        block.style.display = blocked ? 'flex' : 'none';
        block.setAttribute('aria-hidden', blocked ? 'false' : 'true');
    };

    window.EPL.Controllers.Orientation = OrientationController;
})();
