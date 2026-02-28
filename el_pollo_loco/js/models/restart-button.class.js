/**
 * @fileoverview
 * Restart button controller that manages the restart UI element, bindings, and restart flow coordination.
 *
 * Exposed as a window-backed singleton class to avoid duplicate controller definitions.
 */
window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};
window.__epl_restart_button_controller_class = window.__epl_restart_button_controller_class || class RestartButtonController {
  /**
   * Initializes a new methods instance and sets up default runtime state.
   * The constructor prepares dependencies used by class behavior.
   * @param {object} deps - Object argument used by this routine.
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

  /**
   * Returns the watch interval.
   * This helper centralizes read access for callers.
   * @returns {number} Returns the computed numeric value.
   */
  getWatchInterval() {
    return 250;
  }

  /**
   * Returns the min ratio.
   * This helper centralizes read access for callers.
   * @returns {number} Returns the computed numeric value.
   */
  getMinRatio() {
    return 0.64;
  }

  /**
   * Returns the button gap.
   * This helper centralizes read access for callers.
   * @returns {number} Returns the computed numeric value.
   */
  getButtonGap() {
    return 12;
  }

  /**
   * Initializes timers.
   * It is part of the module startup flow.
   */
  initTimers() {
    this.raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (cb) => window.setTimeout(() => cb(Date.now()), 16);
    this.rafCancel = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : window.clearTimeout;
  }

  /**
   * Binds handlers.
   * The operation is isolated here to keep behavior predictable.
   */
  bindHandlers() {
    this.onResizeBound = this.onResize.bind(this);
    this.onClickBound = this.handleClick.bind(this);
    this.watchTickBound = this.watchTick.bind(this);
  }

  /**
   * Initializes routine.
   * It is part of the module startup flow.
   */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.resolveElements();
    this.ensureButton();
    this.bindEvents();
    this.startWatcher();
  }

  /**
   * Resolves elements.
   * The operation is isolated here to keep behavior predictable.
   */
  resolveElements() {
    this.shell = document.getElementById('fullscreen-target');
    this.canvas = document.getElementById('canvas');
    this.overlay = document.querySelector('.game-overlay');
    this.topRight = document.querySelector('.game-overlay__top-right');
    this.bottomControls = document.querySelector('.game-overlay__bottom-controls');
    this.touchControls = document.getElementById('touch-controls');
    this.mobileToggle = document.getElementById('mobile-controls-toggle');
  }

  /**
   * Returns the container.
   * This helper centralizes read access for callers.
   * @returns {unknown} Returns the value produced by this routine.
   */
  getContainer() {
    return this.overlay || this.shell;
  }

  /**
   * Ensures button is available before continuing.
   * The operation is isolated here to keep behavior predictable.
   */
  ensureButton() {
    let btn;
    let container;
    if (!this.shell || !this.canvas) return;
    container = this.getContainer();
    if (!container) return;
    btn = document.getElementById('restart-button');
    if (!btn) btn = this.createButton();
    if (btn.parentNode !== container) container.appendChild(btn);
    this.button = btn;
    this.button.hidden = true;
  }

  /**
   * Creates button.
   * The result is consumed by downstream game logic.
   * @returns {unknown} Returns the value produced by this routine.
   */
  createButton() {
    let btn = document.createElement('button');
    btn.id = 'restart-button';
    btn.type = 'button';
    btn.textContent = 'Neustart';
    btn.addEventListener('click', this.onClickBound);
    return btn;
  }

  /**
   * Binds events.
   * The operation is isolated here to keep behavior predictable.
   */
  bindEvents() {
    window.addEventListener('resize', this.onResizeBound);
    window.addEventListener('orientationchange', this.onResizeBound);
    document.addEventListener('fullscreenchange', this.onResizeBound);
  }

  /**
   * Starts watcher.
   * The operation is isolated here to keep behavior predictable.
   */
  startWatcher() {
    if (this.watchId) return;
    this.watchId = this.trackInterval(this.watchTickBound, this.getWatchInterval());
    this.watchTick();
  }

  /**
   * Executes the track interval routine.
   * The logic is centralized here for maintainability.
   * @param {Function} fn - Callback function executed by this helper.
   * @param {unknown} ms - Input value used by this routine.
   * @returns {unknown} Returns the value produced by this routine.
   */
  trackInterval(fn, ms) {
    let id = window.setInterval(fn, ms);
    this.intervalIds.add(id);
    return id;
  }

  /**
   * Executes the watch tick routine.
   * The logic is centralized here for maintainability.
   */
  watchTick() {
    let ended = this.getEndState();
    if (ended !== this.visible) this.setVisible(ended);
  }

  /**
   * Returns the end state.
   * This helper centralizes read access for callers.
   * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
   */
  getEndState() {
    let w = this.getWorld();
    let c = w && w.character;
    let dead;
    if (!c) return false;
    dead = c.isDead;
    if (typeof dead === 'function' ? dead.call(c) : dead === true) return true;
    return Boolean(w && w.isBossDefeated && w.isBossDefeated());
  }

  /**
   * Sets the visible.
   * This keeps persistent and in-memory state aligned.
   * @param {boolean} show - Boolean flag controlling this branch.
   */
  setVisible(show) {
    if (!this.button) return;
    if (this.visible === show) return;
    this.visible = show;
    this.button.hidden = !show;
    if (show) this.schedulePosition();
  }

  /**
   * Schedules position.
   * The operation is isolated here to keep behavior predictable.
   */
  schedulePosition() {
    if (!this.visible || this.rafId) return;
    this.rafId = this.raf(() => {
      this.rafId = 0;
      this.position();
    });
  }

  /**
   * Handles resize.
   * It applies side effects required by this branch.
   */
  onResize() {
    if (this.visible) this.schedulePosition();
  }

  /**
   * Executes the position routine.
   * The logic is centralized here for maintainability.
   */
  position() {
    let bounds;
    let top;
    if (!this.button || !this.canvas || !this.shell) return;
    bounds = this.getBounds();
    if (!bounds) return;
    top = this.computeTop(bounds);
    this.button.style.top = top + 'px';
  }

  /**
   * Returns the bounds.
   * This helper centralizes read access for callers.
   * @returns {object|null} Returns the value computed for the active runtime branch.
   */
  getBounds() {
    let root = this.shell;
    let container = this.getContainer();
    let containerTop;
    let canvasTop;
    let canvasHeight;
    let btnHeight;
    let gap;
    let blockerTop;
    let localCanvasTop;
    let topMin;
    let topMax;
    if (!root || !container || !this.canvas || !this.button) return null;
    containerTop = this.getOffsetTop(container, root) || 0;
    canvasTop = this.getOffsetTop(this.canvas, root);
    if (canvasTop === null) return null;
    canvasHeight = this.canvas.offsetHeight || 0;
    btnHeight = this.button.offsetHeight || 0;
    gap = this.getButtonGap();
    blockerTop = this.getBlockerTop(root, containerTop);
    localCanvasTop = canvasTop - containerTop;
    topMin = this.getTopMin(localCanvasTop, canvasHeight, gap, root, containerTop);
    topMax = this.getTopMax(localCanvasTop, canvasHeight, btnHeight, gap, blockerTop);
    return { canvasTop: localCanvasTop, canvasHeight, btnHeight, gap, topMin, topMax, blockerTop };
  } /////////////////////////////viel zu groß und definition von einzelnen klassen muss umgebaut werden ///////////////

  /**
   * Returns the scale.
   * This helper centralizes read access for callers.
   * @param {object} shellRect - Object argument used by this routine.
   * @returns {number} Returns the computed numeric value.
   */
  getScale(shellRect) {
    let raw = this.shell.offsetHeight || shellRect.height || 1;
    let scale = shellRect.height / raw;
    return scale || 1;
  }

  /**
   * Executes the to local y routine.
   * The logic is centralized here for maintainability.
   * @param {number} value - Numeric value used by this routine.
   * @param {number} shellTop - Numeric value used by this routine.
   * @param {number} scale - Numeric value used by this routine.
   * @returns {number} Returns the computed numeric value.
   */
  toLocalY(value, shellTop, scale) {
    return (value - shellTop) / scale;
  }

  /**
   * Returns the rect.
   * This helper centralizes read access for callers.
   * @param {object} el - Object argument used by this routine.
   * @returns {unknown|null} Returns the value computed for the active runtime branch.
   */
  getRect(el) {
    let rect;
    if (!el) return null;
    rect = el.getBoundingClientRect();
    if (!rect || rect.height === 0 || rect.width === 0) return null;
    return rect;
  }

  /**
   * Returns the offset top.
   * This helper centralizes read access for callers.
   * @param {unknown} el - Input value used by this routine.
   * @param {unknown} root - Input value used by this routine.
   * @returns {unknown|null} Returns the value computed for the active runtime branch.
   */
  getOffsetTop(el, root) {
    let top = 0;
    let node = el;
    if (!el || !root) return null;
    while (node && node !== root) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node !== root) return null;
    return top;
  }

  /**
   * Returns the top.
   * This helper centralizes read access for callers.
   * @param {unknown} el - Input value used by this routine.
   * @param {unknown} root - Input value used by this routine.
   * @param {number} containerTop - Numeric value used by this routine.
   * @returns {unknown} Returns the value produced by this routine.
   */
  getTop(el, root, containerTop) {
    let top = this.getOffsetTop(el, root);
    if (top === null) return Infinity;
    return top - containerTop;
  }

  /**
   * Returns the bottom.
   * This helper centralizes read access for callers.
   * @param {object} el - Object argument used by this routine.
   * @param {unknown} root - Input value used by this routine.
   * @param {number} containerTop - Numeric value used by this routine.
   * @returns {number} Returns the computed numeric value.
   */
  getBottom(el, root, containerTop) {
    let top = this.getOffsetTop(el, root);
    if (top === null) return 0;
    return top - containerTop + (el.offsetHeight || 0);
  }

  /**
   * Returns the blocker top.
   * This helper centralizes read access for callers.
   * @param {unknown} root - Input value used by this routine.
   * @param {number} containerTop - Numeric value used by this routine.
   * @returns {unknown|null} Returns the value computed for the active runtime branch.
   */
  getBlockerTop(root, containerTop) {
    let blocker = this.bottomControls || this.mobileToggle;
    let top = this.getOffsetTop(blocker, root);
    if (top === null) return null;
    return top - containerTop;
  }

  /**
   * Returns the top min.
   * This helper centralizes read access for callers.
   * @param {HTMLCanvasElement} canvasTop - Input value used by this routine.
   * @param {HTMLCanvasElement} canvasHeight - Input value used by this routine.
   * @param {number} gap - Numeric value used by this routine.
   * @param {unknown} root - Input value used by this routine.
   * @param {unknown} containerTop - Input value used by this routine.
   * @returns {number} Returns the computed numeric value.
   */
  getTopMin(canvasTop, canvasHeight, gap, root, containerTop) {
    let base = canvasTop + canvasHeight * this.getMinRatio();
    let topRightBottom = this.getBottom(this.topRight, root, containerTop);
    return Math.max(base, topRightBottom + gap);
  }

  /**
   * Returns the top max.
   * This helper centralizes read access for callers.
   * @param {HTMLCanvasElement} canvasTop - Input value used by this routine.
   * @param {HTMLCanvasElement} canvasHeight - Input value used by this routine.
   * @param {number} btnHeight - Numeric value used by this routine.
   * @param {number} gap - Numeric value used by this routine.
   * @param {number} blockerTop - Numeric value used by this routine.
   * @returns {number} Returns the computed numeric value.
   */
  getTopMax(canvasTop, canvasHeight, btnHeight, gap, blockerTop) {
    if (blockerTop !== null && blockerTop !== undefined) return blockerTop - btnHeight - gap;
    return canvasTop + canvasHeight - btnHeight - gap;
  }

  /**
   * Computes top.
   * The operation is isolated here to keep behavior predictable.
   * @param {object} bounds - Bounds object used to clamp or validate coordinates.
   * @returns {unknown} Returns the value produced by this routine.
   */
  computeTop(bounds) {
    let target = bounds.blockerTop === null || bounds.blockerTop === undefined ? bounds.topMax : bounds.blockerTop - bounds.btnHeight - bounds.gap;
    let max = Math.max(bounds.topMin, bounds.topMax);
    return this.clamp(target, bounds.topMin, max);
  }

  /**
   * Executes the clamp routine.
   * The logic is centralized here for maintainability.
   * @param {unknown} value - Input value used by this routine.
   * @param {number} min - Numeric value used by this routine.
   * @param {number} max - Numeric value used by this routine.
   * @returns {unknown} Returns the value produced by this routine.
   */
  clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  /**
   * Handles click.
   * It applies side effects required by this branch.
   */
  handleClick() {
    if (this.restarting) return;
    this.restarting = true;
    this.softRestart();
    this.restarting = false;
  }

  /**
   * Executes the soft restart routine.
   * The logic is centralized here for maintainability.
   */
  softRestart() {
    this.stopLoops();
    this.resetService.stopEnemySfxSafe();
    this.resetService.resetGameOver();
    this.resetService.restartGame();
    this.resetService.restartGameOverWatcher();
    this.startWatcher();
    this.setVisible(false);
  }

  /**
   * Stops loops.
   * The operation is isolated here to keep behavior predictable.
   */
  stopLoops() {
    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.intervalIds.clear();
    this.clearRaf();
    this.watchId = 0;
  }

  /**
   * Executes the clear raf routine.
   * The logic is centralized here for maintainability.
   */
  clearRaf() {
    if (!this.rafId) return;
    this.rafCancel(this.rafId);
    this.rafId = 0;
  }

  /**
   * Returns the world.
   * This helper centralizes read access for callers.
   * @returns {unknown} Returns the value produced by this routine.
   */
  getWorld() {
    return this.resetService.getWorld();
  }
};

/**
 * Executes the __epl_boot_restart_button routine.
 * The logic is centralized here for maintainability.
 */
window.__epl_boot_restart_button = window.__epl_boot_restart_button || function() {
  let root = window.EPL || {};
  root.Controllers = root.Controllers || {};
  window.EPL = root;
  if (root.Controllers.RestartButton) return;
  window.__epl_restart_btn_instance = window.__epl_restart_btn_instance || new window.__epl_restart_button_controller_class();
  root.Controllers.RestartButton = window.__epl_restart_btn_instance;
  window.__epl_restart_btn_instance.init();
};

if (!window.__epl_restart_button_boot_bound) {
  window.__epl_restart_button_boot_bound = true;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.__epl_boot_restart_button);
  else window.__epl_boot_restart_button();
}
