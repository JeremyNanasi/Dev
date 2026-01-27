(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Orientation) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let MODES = ['auto', 'portrait', 'landscape'];
    let STORAGE_KEY = 'orientation-mode';

    function OrientationController(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    OrientationController.prototype.initToggle = function() {
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
        let vpOrientation = this.getViewportOrientation();
        this.applyModeClass(mode);
        this.deps.resizeCanvas();
        this.deps.applyContainBaseStyles();
        this.applyTransform(target, vpOrientation);
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

    OrientationController.prototype.applyTransform = function(target, vpOrientation) {
        let bp = this.deps.getBreakpoint();
        let isMobile = window.innerWidth <= bp;
        let rotation = (isMobile && vpOrientation === 'portrait') ? 90 : 0;
        let scale = this.computeScale(rotation);
        target.style.transform = 'translate(-50%, -50%) rotate(' + rotation + 'deg) scale(' + scale + ')';
    };

    OrientationController.prototype.getViewportOrientation = function() {
        if (window.matchMedia) {
            return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
        }
        return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
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

    window.EPL.Controllers.Orientation = OrientationController;
})();
