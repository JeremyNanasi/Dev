(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Orientation) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    var MODES = ['auto', 'portrait', 'landscape'];
    var STORAGE_KEY = 'orientation-mode';

    function OrientationController(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    OrientationController.prototype.initToggle = function() {
        this.toggleButton = document.getElementById('orientation-toggle');
        if (!this.toggleButton) return;
        var self = this;
        this.toggleButton.addEventListener('click', function() { self.handleClick(); });
    };

    OrientationController.prototype.handleClick = function() {
        var current = this.getStoredMode();
        var next = this.getNextMode(current);
        localStorage.setItem(STORAGE_KEY, next);
        this.applyLayout();
    };

    OrientationController.prototype.getStoredMode = function() {
        return localStorage.getItem(STORAGE_KEY) || 'auto';
    };

    OrientationController.prototype.getNextMode = function(current) {
        var index = MODES.indexOf(current);
        if (index === -1) return MODES[0];
        return MODES[(index + 1) % MODES.length];
    };

    OrientationController.prototype.applyStored = function() {
        this.applyLayout(this.getStoredMode());
    };

    OrientationController.prototype.applyLayout = function(forcedMode) {
        var canvas = this.deps.getCanvas();
        var target = this.deps.getTarget();
        if (!canvas || !target) return;
        var mode = this.resolveMode(forcedMode);
        var vpOrientation = this.getViewportOrientation();
        this.applyModeClass(mode);
        this.deps.resizeCanvas();
        this.deps.applyContainBaseStyles();
        this.applyTransform(target, vpOrientation);
    };

    OrientationController.prototype.resolveMode = function(forcedMode) {
        var stored = forcedMode || this.getStoredMode();
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
        var labels = { auto: 'Auto', portrait: 'Hochformat', landscape: 'Querformat' };
        this.toggleButton.textContent = 'Ausrichtung: ' + (labels[mode] || 'Auto');
    };

    OrientationController.prototype.applyTransform = function(target, vpOrientation) {
        var bp = this.deps.getBreakpoint();
        var isMobile = window.innerWidth <= bp;
        var rotation = (isMobile && vpOrientation === 'portrait') ? 90 : 0;
        var scale = this.computeScale(rotation);
        target.style.transform = 'translate(-50%, -50%) rotate(' + rotation + 'deg) scale(' + scale + ')';
    };

    OrientationController.prototype.getViewportOrientation = function() {
        if (window.matchMedia) {
            return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
        }
        return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
    };

    OrientationController.prototype.computeScale = function(rotation) {
        var w = this.deps.getCanvasWidth();
        var h = this.deps.getCanvasHeight();
        var normalized = ((rotation % 360) + 360) % 360;
        var rotated = normalized === 90 || normalized === 270;
        var baseW = rotated ? h : w;
        var baseH = rotated ? w : h;
        return Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    };

    window.EPL.Controllers.Orientation = OrientationController;
})();
