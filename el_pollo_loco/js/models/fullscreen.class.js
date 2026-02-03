(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.Fullscreen) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    function FullscreenController(deps) {
        this.deps = deps;
        this.toggleButton = null;
    }

    FullscreenController.prototype.ensureTarget = function(canvasEl) {
        let existing = document.getElementById('fullscreen-target');
        if (existing) {
            this.applyDefaults(existing);
            return existing;
        }
        return this.createTarget(canvasEl);
    };

    FullscreenController.prototype.createTarget = function(canvasEl) {
        let wrapper = document.createElement('div');
        wrapper.id = 'fullscreen-target';
        let parent = canvasEl.parentNode;
        parent.insertBefore(wrapper, canvasEl);
        wrapper.appendChild(canvasEl);
        this.applyDefaults(wrapper);
        return wrapper;
    };

    FullscreenController.prototype.applyDefaults = function(wrapper) {
        wrapper.style.display = 'block';
        wrapper.style.position = 'absolute';
    };

    FullscreenController.prototype.initToggle = function() {
        this.toggleButton = document.getElementById('fullscreen-toggle');
        if (!this.toggleButton) return;
        this.registerListeners();
    };

    FullscreenController.prototype.registerListeners = function() {
        let self = this;
        this.toggleButton.addEventListener('click', function() { self.handleClick(); });
        document.addEventListener('fullscreenchange', function() { self.handleChange(); });
        this.updateButtonState();
    };

    FullscreenController.prototype.handleClick = function() {
        if (document.fullscreenElement) {
            document.exitFullscreen && document.exitFullscreen();
            return;
        }
        let fsEl = document.getElementById('viewport') || this.deps.getTarget() || this.deps.getCanvas();
        if (fsEl && fsEl.requestFullscreen) fsEl.requestFullscreen();
    };

    FullscreenController.prototype.handleChange = function() {
        this.updateButtonState();
        document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
        if (this.deps.onFullscreenChange) this.deps.onFullscreenChange();
    };

    FullscreenController.prototype.updateButtonState = function() {
        if (!this.toggleButton) return;
        let isFs = Boolean(document.fullscreenElement);
        this.toggleButton.textContent = isFs ? 'Vollbild verlassen' : 'Vollbild';
        this.toggleButton.classList.toggle('is-active', isFs);
    };

    FullscreenController.prototype.applyContainBaseStyles = function() {
        let target = this.deps.getTarget();
        if (!target) return;
        let w = this.deps.getCanvasWidth();
        let h = this.deps.getCanvasHeight();
        target.style.position = 'absolute';
        target.style.left = '50%';
        target.style.top = '50%';
        target.style.width = w + 'px';
        target.style.height = h + 'px';
        this.applyExtraStyles(target);
    };

    FullscreenController.prototype.applyExtraStyles = function(target) {
        target.style.display = 'block';
        target.style.alignItems = '';
        target.style.justifyContent = '';
        target.style.background = 'transparent';
    };

    FullscreenController.prototype.isFullscreen = function() {
        return Boolean(document.fullscreenElement);
    };

    window.EPL.Controllers.Fullscreen = FullscreenController;
})();
