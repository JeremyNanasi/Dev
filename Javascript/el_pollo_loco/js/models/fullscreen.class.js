/**
 * @fileoverview
 * Provides the fullscreen controller used by the game UI.
 *
 * The controller wraps the canvas into a dedicated fullscreen target element, binds the fullscreen toggle button,
 * and keeps the UI state in sync with the browser fullscreen API.
 */

/**
 * @typedef {Object} FullscreenDeps
 * @property {function(): (HTMLElement|null)} getTarget - Returns the current fullscreen wrapper element (if any).
 * @property {function(): (HTMLCanvasElement|null)} getCanvas - Returns the game canvas element.
 * @property {function(): number} getCanvasWidth - Returns the desired canvas width in pixels.
 * @property {function(): number} getCanvasHeight - Returns the desired canvas height in pixels.
 * @property {function(): void} [onFullscreenChange] - Optional callback invoked after fullscreen state changes.
 */

window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};
/**
 * Fullscreen controller implementation exposed via `window.EPL.Controllers.Fullscreen`.
 */
window.EPL.Controllers.Fullscreen = window.EPL.Controllers.Fullscreen || class FullscreenController {
    /**
     * Initializes the fullscreen controller with the required dependency callbacks.
     * @param {FullscreenDeps} deps - Callback-based accessors used to resolve elements and sizing.
     */
    constructor(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    /**
     * Ensures the fullscreen wrapper element exists and contains the provided canvas element.
     * @param {HTMLElement} canvasEl - Canvas element to wrap inside the fullscreen target.
     * @returns {HTMLElement} The wrapper element used as the fullscreen target.
     */
    ensureTarget(canvasEl) {
        let existing = document.getElementById('fullscreen-target');
        if (existing) {
            this.applyDefaults(existing);
            return existing;
        }
        return this.createTarget(canvasEl);
    }

    /**
     * Creates and attaches the fullscreen wrapper element, then moves the canvas into it.
     * @param {HTMLElement} canvasEl - Canvas element to wrap inside the created target.
     * @returns {HTMLDivElement} The created wrapper element.
     */
    createTarget(canvasEl) {
        let wrapper = document.createElement('div');
        let parent = canvasEl && canvasEl.parentNode;
        wrapper.id = 'fullscreen-target';
        if (parent) parent.insertBefore(wrapper, canvasEl);
        if (canvasEl) wrapper.appendChild(canvasEl);
        this.applyDefaults(wrapper);
        return wrapper;
    }

    /**
     * Applies base inline styles required for the fullscreen wrapper to behave correctly.
     * @param {HTMLElement} wrapper - Wrapper element receiving the default styles.
     */
    applyDefaults(wrapper) {
        wrapper.style.display = 'block';
        wrapper.style.position = 'absolute';
    }

    /**
     * Finds the fullscreen toggle button in the DOM and binds the required listeners.
     */
    initToggle() {
        this.toggleButton = document.getElementById('fullscreen-toggle');
        if (!this.toggleButton) return;
        this.registerListeners();
    }

    /**
     * Registers the click and fullscreenchange listeners and updates the initial button state.
     */
    registerListeners() {
        this.toggleButton.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('fullscreenchange', this.handleChange.bind(this));
        this.updateButtonState();
    }

    /**
     * Toggles fullscreen mode for the resolved viewport target (or exits fullscreen when active).
     */
    handleClick() {
        let fsEl;
        if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            return;
        }
        fsEl = document.getElementById('viewport') || this.deps.getTarget() || this.deps.getCanvas();
        if (fsEl && fsEl.requestFullscreen) fsEl.requestFullscreen();
    }

    /**
     * Synchronizes UI and notifies optional callbacks after the browser fullscreen state changes.
     */
    handleChange() {
        this.updateButtonState();
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        if (this.deps.onFullscreenChange) this.deps.onFullscreenChange();
    }

    /**
     * Updates the toggle button label and active class based on the current fullscreen state.
     */
    updateButtonState() {
        let isFs;
        if (!this.toggleButton) return;
        isFs = Boolean(document.fullscreenElement);
        this.toggleButton.textContent = isFs ? 'Vollbild verlassen' : 'Vollbild';
        this.toggleButton.classList.toggle('is-active', isFs);
    }

    /**
     * Applies the base 'contain' layout styles to the fullscreen target using the configured canvas size.
     */
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

    /**
     * Applies additional style resets to the fullscreen target to avoid layout artifacts.
     * @param {HTMLElement} target - Target element receiving additional style resets.
     */
    applyExtraStyles(target) {
        target.style.display = 'block';
        target.style.alignItems = '';
        target.style.justifyContent = '';
        target.style.background = 'transparent';
    }

    /**
     * Returns whether any element is currently fullscreen.
     * @returns {boolean} True if the document has an active fullscreen element; otherwise false.
     */
    isFullscreen() {
        return Boolean(document.fullscreenElement);
    }
};