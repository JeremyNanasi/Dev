window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.Fullscreen = window.EPL.Controllers.Fullscreen || class FullscreenController {
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    ensureTarget(canvasEl) {
        var existing = document.getElementById('fullscreen-target');
        if (existing) {
            this.applyDefaults(existing);
            return existing;
        }
        return this.createTarget(canvasEl);
    }

    createTarget(canvasEl) {
        var wrapper = document.createElement('div');
        var parent = canvasEl && canvasEl.parentNode;
        wrapper.id = 'fullscreen-target';
        if (parent) parent.insertBefore(wrapper, canvasEl);
        if (canvasEl) wrapper.appendChild(canvasEl);
        this.applyDefaults(wrapper);
        return wrapper;
    }

    applyDefaults(wrapper) {
        wrapper.style.display = 'block';
        wrapper.style.position = 'absolute';
    }

    initToggle() {
        this.toggleButton = document.getElementById('fullscreen-toggle');
        if (!this.toggleButton) return;
        this.registerListeners();
    }

    registerListeners() {
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('fullscreenchange', this.handleChange.bind(this));
        this.updateButtonState();
    }

    handleClick() {
        var fsEl;
        if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            return;
        }
        fsEl = document.getElementById('viewport') || this.deps.getTarget() || this.deps.getCanvas();
        if (fsEl && fsEl.requestFullscreen) fsEl.requestFullscreen();
    }

    handleChange() {
        this.updateButtonState();
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        if (this.deps.onFullscreenChange) this.deps.onFullscreenChange();
    }

    updateButtonState() {
        var isFs;
        if (!this.toggleButton) return;
        isFs = Boolean(document.fullscreenElement);
        this.toggleButton.textContent = isFs ? 'Vollbild verlassen' : 'Vollbild';
        this.toggleButton.classList.toggle('is-active', isFs);
    }

    applyContainBaseStyles() {
        var target = this.deps.getTarget();
        var w = this.deps.getCanvasWidth();
        var h = this.deps.getCanvasHeight();
        if (!target) return;
        target.style.position = 'absolute';
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.width = w + 'px';
        target.style.height = h + 'px';
        this.applyExtraStyles(target);
    }

    applyExtraStyles(target) {
        target.style.display = 'block';
        target.style.alignItems = '';
        target.style.justifyContent = '';
        target.style.background = 'transparent';
    }

    isFullscreen() {
        return Boolean(document.fullscreenElement);
    }
};
