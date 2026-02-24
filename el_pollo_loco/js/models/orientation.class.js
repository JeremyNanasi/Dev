window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.__epl_wrap_interval_callback = window.__epl_wrap_interval_callback || function(cb) {
    return function() {
        if (document.body && document.body.classList.contains('epl-orientation-blocked')) return;
        return cb.apply(this, arguments);
    };
};

window.__epl_install_interval_guard = window.__epl_install_interval_guard || function() {
    if (window.__epl_interval_guarded) return;
    window.__epl_original_set_interval = window.__epl_original_set_interval || window.setInterval;
    window.setInterval = function(cb, delay) {
        if (typeof cb !== 'function') return window.__epl_original_set_interval(cb, delay);
        return window.__epl_original_set_interval(window.__epl_wrap_interval_callback(cb), delay);
    };
    window.__epl_interval_guarded = true;
};

window.EPL.Controllers.Orientation = window.EPL.Controllers.Orientation || class OrientationController {
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
        this.blockMql = null;
        this.blockHandler = null;
    }

    getStorageKey() {
        return window.EPL && window.EPL.KEYS && window.EPL.KEYS.ORIENTATION_MODE ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    }

    getModes() {
        var modes = window.EPL && Array.isArray(window.EPL.ORIENTATION_MODES) ? window.EPL.ORIENTATION_MODES : null;
        return modes && modes.length ? modes : ['auto', 'portrait', 'landscape'];
    }

    getBlockQuery() {
        return '(pointer: coarse) and (orientation: portrait)';
    }

    getHubMaxLong() {
        return 1280;
    }

    getHubMaxShort() {
        return 800;
    }

    isWithinHubMax() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        return Math.max(w, h) <= this.getHubMaxLong() && Math.min(w, h) <= this.getHubMaxShort();
    }

    initToggle() {
        this.initBlocker();
        this.toggleButton = document.getElementById('orientation-toggle');
        if (!this.toggleButton) return;
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick() {
        var current = this.getStoredMode();
        var next = this.getNextMode(current);
        localStorage.setItem(this.getStorageKey(), next);
        this.applyLayout();
    }

    getStoredMode() {
        return localStorage.getItem(this.getStorageKey()) || 'auto';
    }

    getNextMode(current) {
        var modes = this.getModes();
        var index = modes.indexOf(current);
        if (index === -1) return modes[0];
        return modes[(index + 1) % modes.length];
    }

    applyStored() {
        this.applyLayout(this.getStoredMode());
    }

    applyLayout(forcedMode) {
        var canvas = this.deps.getCanvas();
        var target = this.deps.getTarget();
        var mode = this.resolveMode(forcedMode);
        if (!canvas || !target) return;
        this.applyModeClass(mode);
        this.deps.resizeCanvas();
        this.deps.applyContainBaseStyles();
        this.applyTransform(target);
    }

    resolveMode(forcedMode) {
        var stored = forcedMode || this.getStoredMode();
        var modes = this.getModes();
        return modes.indexOf(stored) !== -1 ? stored : 'auto';
    }

    applyModeClass(mode) {
        document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
        document.body.classList.add('orientation-' + mode);
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        this.updateButtonLabel(mode);
    }

    updateButtonLabel(mode) {
        var labels = { auto: 'Auto', portrait: 'Hochformat', landscape: 'Querformat' };
        if (!this.toggleButton) return;
        this.toggleButton.textContent = 'Ausrichtung: ' + (labels[mode] || 'Auto');
    }

    applyTransform(target) {
        var scales = this.computeScalePair(0);
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.transform = 'translate(-50%, -50%) scale(' + scales.x + ', ' + scales.y + ')';
    }

    computeScale(rotation) {
        var w = this.deps.getCanvasWidth();
        var h = this.deps.getCanvasHeight();
        var normalized = ((rotation % 360) + 360) % 360;
        var rotated = normalized === 90 || normalized === 270;
        var baseW = rotated ? h : w;
        var baseH = rotated ? w : h;
        return Math.min(window.innerWidth / baseW, window.innerHeight / baseH);
    }

    computeScalePair(rotation) {
        var w = this.deps.getCanvasWidth();
        var h = this.deps.getCanvasHeight();
        var n = ((rotation % 360) + 360) % 360;
        var rot = n === 90 || n === 270;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var sx = rot ? vh / w : vw / w;
        var sy = rot ? vw / h : vh / h;
        var baseW = rot ? h : w;
        var baseH = rot ? w : h;
        var factor = 0.85;
        var baseLong = Math.max(baseW, baseH);
        var baseShort = Math.min(baseW, baseH);
        var cap = Math.min(this.getHubMaxLong() / baseLong, this.getHubMaxShort() / baseShort) * factor;
        var s = Math.min(vw / baseW, vh / baseH) * factor;
        if (document.fullscreenElement) return { x: sx, y: sy };
        if (s > cap) s = cap;
        return { x: s, y: s };
    }

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

    handleBlockChange() {
        var blocked = Boolean(this.blockMql && this.blockMql.matches) && this.isWithinHubMax();
        this.applyBlockState(blocked);
    }

    applyBlockState(blocked) {
        document.body.classList.toggle('epl-orientation-blocked', blocked);
        this.updateBlockAria(blocked);
        window.dispatchEvent(new CustomEvent('epl:orientation-blocked', { detail: { blocked: blocked } }));
    }

    updateBlockAria(blocked) {
        var block = document.getElementById('orientation-block');
        if (!block) return;
        block.style.display = blocked ? 'flex' : 'none';
        block.setAttribute('aria-hidden', blocked ? 'false' : 'true');
    }
};
