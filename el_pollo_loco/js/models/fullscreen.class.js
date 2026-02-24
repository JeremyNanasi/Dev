window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.Fullscreen = window.EPL.Controllers.Fullscreen || class FullscreenController {
    /** Initialize fullscreen controller dependencies. @param {{getTarget:Function,getCanvas:Function,getCanvasWidth:Function,getCanvasHeight:Function,onFullscreenChange?:Function}} deps */
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    /** Ensure the fullscreen wrapper exists for the canvas. @param {HTMLElement} canvasEl @returns {HTMLElement} */
    ensureTarget(canvasEl) {
        let existing = document.getElementById('fullscreen-target');
        if (existing) {
            this.applyDefaults(existing);
            return existing;
        }
        return this.createTarget(canvasEl);
    }

    /** Create and attach the fullscreen wrapper. @param {HTMLElement} canvasEl @returns {HTMLDivElement} */
    createTarget(canvasEl) {
        let wrapper = document.createElement('div');
        let parent = canvasEl && canvasEl.parentNode;
        wrapper.id = 'fullscreen-target';
        if (parent) parent.insertBefore(wrapper, canvasEl);
        if (canvasEl) wrapper.appendChild(canvasEl);
        this.applyDefaults(wrapper);
        return wrapper;
    }

    /** Apply base styles to the fullscreen wrapper. @param {HTMLElement} wrapper */
    applyDefaults(wrapper) {
        wrapper.style.display = 'block';
        wrapper.style.position = 'absolute';
    }

    /** Initialize the fullscreen toggle button. */
    initToggle() {
        this.toggleButton = document.getElementById('fullscreen-toggle');
        if (!this.toggleButton) return;
        this.registerListeners();
    }

    /** Register fullscreen button and document listeners. */
    registerListeners() {
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('fullscreenchange', this.handleChange.bind(this));
        this.updateButtonState();
    }

    /** Toggle fullscreen mode for the viewport target. */
    handleClick() {
        let fsEl;
        if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            return;
        }
        fsEl = document.getElementById('viewport') || this.deps.getTarget() || this.deps.getCanvas();
        if (fsEl && fsEl.requestFullscreen) fsEl.requestFullscreen();
    }

    /** Sync UI state after fullscreen state changes. */
    handleChange() {
        this.updateButtonState();
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        if (this.deps.onFullscreenChange) this.deps.onFullscreenChange();
    }

    /** Update toggle label and active state. */
    updateButtonState() {
        let isFs;
        if (!this.toggleButton) return;
        isFs = Boolean(document.fullscreenElement);
        this.toggleButton.textContent = isFs ? 'Vollbild verlassen' : 'Vollbild';
        this.toggleButton.classList.toggle('is-active', isFs);
    }

    /** Apply default contain layout styles for the fullscreen target. */
    applyContainBaseStyles() {
        let target = this.deps.getTarget();
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        if (!target) return;
        target.style.position = 'absolute';
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.width = w + 'px';
        target.style.height = h + 'px';
        this.applyExtraStyles(target);
    }

    /** Apply additional style resets to the fullscreen target. @param {HTMLElement} target */
    applyExtraStyles(target) {
        target.style.display = 'block';
        target.style.alignItems = '';
        target.style.justifyContent = '';
        target.style.background = 'transparent';
    }

    /** Return whether any element is currently fullscreen. @returns {boolean} */
    isFullscreen() {
        return Boolean(document.fullscreenElement);
    }
};
