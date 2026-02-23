/**
 * @fileoverview Restart button controller that manages visibility and soft reset flow.
 */
(() => {
  const WATCH_INTERVAL = 250;
  const MIN_RATIO = 0.64;
  const BTN_GAP = 12;
  /**
   * Controls restart-button lifecycle, placement, and click handling.
   */
  class RestartButtonController {
    /**
     * @param {Object} [deps]
     */
    constructor(deps) {
      this.deps = deps || {};
      this.button = this.shell = this.canvas = this.overlay = null;
      this.topRight = this.bottomControls = this.touchControls = this.mobileToggle = null;
      this.visible = this.restarting = false;
      this.initialized = false;
      this.watchId = this.rafId = 0;
      this.intervalIds = new Set();
      this.resetService = new RestartButtonResetService(this);
      this.initTimers();
      this.bindHandlers();
    }
    /** Initializes `initTimers`. */
    initTimers() {
      this.raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (cb) => window.setTimeout(() => cb(Date.now()), 16);
      this.rafCancel = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : window.clearTimeout;
    }
    /** Runs `bindHandlers`. */
    bindHandlers() {
      this.onResizeBound = this.onResize.bind(this);
      this.onClickBound = this.handleClick.bind(this);
      this.watchTickBound = this.watchTick.bind(this);
    }

    /**
     * Initializes controller once and starts visibility watcher.
     * @returns {void}
     */
    init() {
      if (this.initialized) return;
      this.initialized = true;
      this.resolveElements();
      this.ensureButton();
      this.bindEvents();
      this.startWatcher();
    }
    /** Runs `resolveElements`. */
    resolveElements() {
      this.shell = document.getElementById('fullscreen-target');
      this.canvas = document.getElementById('canvas');
      this.overlay = document.querySelector('.game-overlay');
      this.topRight = document.querySelector('.game-overlay__top-right');
      this.bottomControls = document.querySelector('.game-overlay__bottom-controls');
      this.touchControls = document.getElementById('touch-controls');
      this.mobileToggle = document.getElementById('mobile-controls-toggle');
    }
    /** Gets `getContainer` data. @returns {*} Result. */
    getContainer() {
      return this.overlay || this.shell;
    }
    /** Runs `ensureButton`. @returns {*} Result. */
    ensureButton() {
      if (!this.shell || !this.canvas) return;
      const container = this.getContainer();
      if (!container) return;
      let btn = document.getElementById('restart-button');
      if (!btn) btn = this.createButton();
      if (btn.parentNode !== container) container.appendChild(btn);
      this.button = btn;
      this.button.hidden = true;
    }
    /** Creates `createButton` data. @returns {*} Result. */
    createButton() {
      const btn = document.createElement('button');
      btn.id = 'restart-button';
      btn.type = 'button';
      btn.textContent = 'Neustart';
      btn.addEventListener('click', this.onClickBound);
      return btn;
    }
    /** Runs `bindEvents`. */
    bindEvents() {
      window.addEventListener('resize', this.onResizeBound);
      window.addEventListener('orientationchange', this.onResizeBound);
      document.addEventListener('fullscreenchange', this.onResizeBound);
    }
    /** Runs `startWatcher`. @returns {*} Result. */
    startWatcher() {
      if (this.watchId) return;
      this.watchId = this.trackInterval(this.watchTickBound, WATCH_INTERVAL);
      this.watchTick();
    }
    /** Runs `trackInterval`. @param {*} fn - Value. @param {*} ms - Value. @returns {*} Result. */
    trackInterval(fn, ms) {
      const id = window.setInterval(fn, ms);
      this.intervalIds.add(id);
      return id;
    }
    /** Runs `watchTick`. */
    watchTick() {
      const ended = this.getEndState();
      if (ended !== this.visible) this.setVisible(ended);
    }
    /** Gets `getEndState` data. @returns {*} Result. */
    getEndState() {
      const w = this.getWorld();
      const c = w && w.character;
      if (!c) return false;
      const dead = c.isDead;
      if (typeof dead === 'function' ? dead.call(c) : dead === true) return true;
      return Boolean(w && w.isBossDefeated && w.isBossDefeated());
    }
    /** Sets `setVisible` state. @param {*} show - Value. @returns {*} Result. */
    setVisible(show) {
      if (!this.button) return;
      if (this.visible === show) return;
      this.visible = show;
      this.button.hidden = !show;
      if (show) this.schedulePosition();
    }
    /** Runs `schedulePosition`. @returns {*} Result. */
    schedulePosition() {
      if (!this.visible || this.rafId) return;
      this.rafId = this.raf(() => {
        this.rafId = 0;
        this.position();
      });
    }
    /** Runs `onResize`. */
    onResize() {
      if (this.visible) this.schedulePosition();
    }
    /** Runs `position`. @returns {*} Result. */
    position() {
      if (!this.button || !this.canvas || !this.shell) return;
      const bounds = this.getBounds();
      if (!bounds) return;
      const top = this.computeTop(bounds);
      this.button.style.top = `${top}px`;
    }
    /** Gets `getBounds` data. @returns {*} Result. */
    getBounds() {
      const root = this.shell, container = this.getContainer();
      if (!root || !container || !this.canvas || !this.button) return null;
      const containerTop = this.getOffsetTop(container, root) || 0;
      const canvasTop = this.getOffsetTop(this.canvas, root);
      if (canvasTop === null) return null;
      const canvasHeight = this.canvas.offsetHeight || 0, btnHeight = this.button.offsetHeight || 0;
      const gap = BTN_GAP;
      const blockerTop = this.getBlockerTop(root, containerTop);
      const localCanvasTop = canvasTop - containerTop;
      const topMin = this.getTopMin(localCanvasTop, canvasHeight, gap, root, containerTop);
      const topMax = this.getTopMax(localCanvasTop, canvasHeight, btnHeight, gap, blockerTop);
      return { canvasTop: localCanvasTop, canvasHeight, btnHeight, gap, topMin, topMax, blockerTop };
    }
    /** Gets `getScale` data. @param {*} shellRect - Value. @returns {*} Result. */
    getScale(shellRect) {
      const raw = this.shell.offsetHeight || shellRect.height || 1;
      const scale = shellRect.height / raw;
      return scale || 1;
    }
    /** Runs `toLocalY`. @param {*} value - Value. @param {*} shellTop - Value. @param {*} scale - Value. @returns {*} Result. */
    toLocalY(value, shellTop, scale) {
      return (value - shellTop) / scale;
    }
    /** Gets `getRect` data. @param {*} el - Value. @returns {*} Result. */
    getRect(el) {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (!rect || rect.height === 0 || rect.width === 0) return null;
      return rect;
    }
    /** Gets `getOffsetTop` data. @param {*} el - Value. @param {*} root - Value. @returns {*} Result. */
    getOffsetTop(el, root) {
      if (!el || !root) return null;
      let top = 0;
      let node = el;
      while (node && node !== root) {
        top += node.offsetTop || 0;
        node = node.offsetParent;
      }
      if (node !== root) return null;
      return top;
    }
    /** Gets `getTop` data. @param {*} el - Value. @param {*} root - Value. @param {*} containerTop - Value. @returns {*} Result. */
    getTop(el, root, containerTop) {
      const top = this.getOffsetTop(el, root);
      if (top === null) return Infinity;
      return top - containerTop;
    }
    /** Gets `getBottom` data. @param {*} el - Value. @param {*} root - Value. @param {*} containerTop - Value. @returns {*} Result. */
    getBottom(el, root, containerTop) {
      const top = this.getOffsetTop(el, root);
      if (top === null) return 0;
      return top - containerTop + (el.offsetHeight || 0);
    }
    /** Gets `getBlockerTop` data. @param {*} root - Value. @param {*} containerTop - Value. @returns {*} Result. */
    getBlockerTop(root, containerTop) {
      const blocker = this.bottomControls || this.mobileToggle;
      const top = this.getOffsetTop(blocker, root);
      if (top === null) return null;
      return top - containerTop;
    }
    /** Gets `getTopMin` data. @param {*} canvasTop - Value. @param {*} canvasHeight - Value. @param {*} gap - Value. @param {*} root - Value. @param {*} containerTop - Value. @returns {*} Result. */
    getTopMin(canvasTop, canvasHeight, gap, root, containerTop) {
      const base = canvasTop + canvasHeight * MIN_RATIO;
      const topRightBottom = this.getBottom(this.topRight, root, containerTop);
      return Math.max(base, topRightBottom + gap);
    }
    /** Gets `getTopMax` data. @param {*} canvasTop - Value. @param {*} canvasHeight - Value. @param {*} btnHeight - Value. @param {*} gap - Value. @param {*} blockerTop - Value. @returns {*} Result. */
    getTopMax(canvasTop, canvasHeight, btnHeight, gap, blockerTop) {
      if (blockerTop !== null && blockerTop !== undefined) return blockerTop - btnHeight - gap;
      return canvasTop + canvasHeight - btnHeight - gap;
    }
    /** Runs `computeTop`. @param {*} bounds - Value. @returns {*} Result. */
    computeTop(bounds) {
      const target = bounds.blockerTop === null || bounds.blockerTop === undefined ? bounds.topMax : bounds.blockerTop - bounds.btnHeight - bounds.gap;
      const max = Math.max(bounds.topMin, bounds.topMax);
      return this.clamp(target, bounds.topMin, max);
    }
    /** Runs `clamp`. @param {*} value - Value. @param {*} min - Value. @param {*} max - Value. @returns {*} Result. */
    clamp(value, min, max) {
      if (value < min) return min;
      if (value > max) return max;
      return value;
    }

    /**
     * Handles restart button clicks with reentrancy protection.
     * @returns {void}
     */
    handleClick() {
      if (this.restarting) return;
      this.restarting = true;
      this.softRestart();
      this.restarting = false;
    }
    /** Runs `softRestart`. */
    softRestart() {
      this.stopLoops(); this.resetService.stopEnemySfxSafe(); this.resetService.resetGameOver();
      this.resetService.restartGame(); this.resetService.restartGameOverWatcher();
      this.startWatcher(); this.setVisible(false);
    }
    /** Runs `stopLoops`. */
    stopLoops() {
      this.intervalIds.forEach((id) => window.clearInterval(id));
      this.intervalIds.clear(); this.clearRaf();
      this.watchId = 0;
    }
    /** Runs `clearRaf`. @returns {*} Result. */
    clearRaf() {
      if (!this.rafId) return;
      this.rafCancel(this.rafId);
      this.rafId = 0;
    }
    /** Gets `getWorld` data. @returns {*} Result. */
    getWorld() {
      return this.resetService.getWorld();
    }

  }
  /** Runs `boot`. @returns {*} Result. */
  const boot = () => {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.RestartButton) return;
    const root = window.EPL || {};
    root.Controllers = root.Controllers || {};
    window.EPL = root;
    const controller = new RestartButtonController();
    root.Controllers.RestartButton = controller;
    controller.init();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
    return;
  }
  boot();
})();
