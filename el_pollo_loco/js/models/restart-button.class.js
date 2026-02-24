window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.__epl_restart_button_controller_class = window.__epl_restart_button_controller_class || class RestartButtonController {
  /** Initialize restart-button controller dependencies. @param {*=} deps */
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

  /** Return watcher interval in milliseconds. @returns {number} */
  getWatchInterval() {
    return 250;
  }

  /** Return the minimum vertical ratio for button placement. @returns {number} */
  getMinRatio() {
    return 0.64;
  }

  /** Return the vertical button gap in pixels. @returns {number} */
  getButtonGap() {
    return 12;
  }

  /** Initialize RAF helper functions. */
  initTimers() {
    this.raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (cb) => window.setTimeout(() => cb(Date.now()), 16);
    this.rafCancel = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : window.clearTimeout;
  }

  /** Bind reusable event handler references. */
  bindHandlers() {
    this.onResizeBound = this.onResize.bind(this);
    this.onClickBound = this.handleClick.bind(this);
    this.watchTickBound = this.watchTick.bind(this);
  }

  /** Initialize controller once. */
  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.resolveElements();
    this.ensureButton();
    this.bindEvents();
    this.startWatcher();
  }

  /** Resolve required DOM elements. */
  resolveElements() {
    this.shell = document.getElementById('fullscreen-target');
    this.canvas = document.getElementById('canvas');
    this.overlay = document.querySelector('.game-overlay');
    this.topRight = document.querySelector('.game-overlay__top-right');
    this.bottomControls = document.querySelector('.game-overlay__bottom-controls');
    this.touchControls = document.getElementById('touch-controls');
    this.mobileToggle = document.getElementById('mobile-controls-toggle');
  }

  /** Return the preferred button container. @returns {HTMLElement|null} */
  getContainer() {
    return this.overlay || this.shell;
  }

  /** Ensure the restart button exists and is attached. */
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

  /** Create the restart button element. @returns {HTMLButtonElement} */
  createButton() {
    let btn = document.createElement('button');
    btn.id = 'restart-button';
    btn.type = 'button';
    btn.textContent = 'Neustart';
    btn.addEventListener('click', this.onClickBound);
    return btn;
  }

  /** Bind resize and fullscreen listeners. */
  bindEvents() {
    window.addEventListener('resize', this.onResizeBound);
    window.addEventListener('orientationchange', this.onResizeBound);
    document.addEventListener('fullscreenchange', this.onResizeBound);
  }

  /** Start the end-state watcher loop. */
  startWatcher() {
    if (this.watchId) return;
    this.watchId = this.trackInterval(this.watchTickBound, this.getWatchInterval());
    this.watchTick();
  }

  /** Track an interval id for later cleanup. @param {Function} fn @param {number} ms @returns {number} */
  trackInterval(fn, ms) {
    let id = window.setInterval(fn, ms);
    this.intervalIds.add(id);
    return id;
  }

  /** Update restart button visibility from game end state. */
  watchTick() {
    let ended = this.getEndState();
    if (ended !== this.visible) this.setVisible(ended);
  }

  /** Return whether the current world is in an end state. @returns {boolean} */
  getEndState() {
    let w = this.getWorld();
    let c = w && w.character;
    let dead;
    if (!c) return false;
    dead = c.isDead;
    if (typeof dead === 'function' ? dead.call(c) : dead === true) return true;
    return Boolean(w && w.isBossDefeated && w.isBossDefeated());
  }

  /** Toggle button visibility and schedule placement. @param {boolean} show */
  setVisible(show) {
    if (!this.button) return;
    if (this.visible === show) return;
    this.visible = show;
    this.button.hidden = !show;
    if (show) this.schedulePosition();
  }

  /** Queue a position update on the next animation frame. */
  schedulePosition() {
    if (!this.visible || this.rafId) return;
    this.rafId = this.raf(() => {
      this.rafId = 0;
      this.position();
    });
  }

  /** Handle resize and orientation updates. */
  onResize() {
    if (this.visible) this.schedulePosition();
  }

  /** Recompute and apply button position. */
  position() {
    let bounds;
    let top;
    if (!this.button || !this.canvas || !this.shell) return;
    bounds = this.getBounds();
    if (!bounds) return;
    top = this.computeTop(bounds);
    this.button.style.top = top + 'px';
  }

  /** Calculate positioning bounds for restart button placement. @returns {*|null} */
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
  }

  /** Return current shell scale relative to offset height. @param {DOMRect} shellRect @returns {number} */
  getScale(shellRect) {
    let raw = this.shell.offsetHeight || shellRect.height || 1;
    let scale = shellRect.height / raw;
    return scale || 1;
  }

  /** Convert viewport Y to local shell Y. @param {number} value @param {number} shellTop @param {number} scale @returns {number} */
  toLocalY(value, shellTop, scale) {
    return (value - shellTop) / scale;
  }

  /** Return a usable element rect or null. @param {Element|null} el @returns {DOMRect|null} */
  getRect(el) {
    let rect;
    if (!el) return null;
    rect = el.getBoundingClientRect();
    if (!rect || rect.height === 0 || rect.width === 0) return null;
    return rect;
  }

  /** Return element top offset relative to root. @param {HTMLElement|null} el @param {HTMLElement|null} root @returns {number|null} */
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

  /** Return element top relative to container. @param {HTMLElement|null} el @param {HTMLElement} root @param {number} containerTop @returns {number} */
  getTop(el, root, containerTop) {
    let top = this.getOffsetTop(el, root);
    if (top === null) return Infinity;
    return top - containerTop;
  }

  /** Return element bottom relative to container. @param {HTMLElement|null} el @param {HTMLElement} root @param {number} containerTop @returns {number} */
  getBottom(el, root, containerTop) {
    let top = this.getOffsetTop(el, root);
    if (top === null) return 0;
    return top - containerTop + (el.offsetHeight || 0);
  }

  /** Return blocker top relative to container. @param {HTMLElement} root @param {number} containerTop @returns {number|null} */
  getBlockerTop(root, containerTop) {
    let blocker = this.bottomControls || this.mobileToggle;
    let top = this.getOffsetTop(blocker, root);
    if (top === null) return null;
    return top - containerTop;
  }

  /** Return minimum allowed top for the button. @param {number} canvasTop @param {number} canvasHeight @param {number} gap @param {HTMLElement} root @param {number} containerTop @returns {number} */
  getTopMin(canvasTop, canvasHeight, gap, root, containerTop) {
    let base = canvasTop + canvasHeight * this.getMinRatio();
    let topRightBottom = this.getBottom(this.topRight, root, containerTop);
    return Math.max(base, topRightBottom + gap);
  }

  /** Return maximum allowed top for the button. @param {number} canvasTop @param {number} canvasHeight @param {number} btnHeight @param {number} gap @param {number|null} blockerTop @returns {number} */
  getTopMax(canvasTop, canvasHeight, btnHeight, gap, blockerTop) {
    if (blockerTop !== null && blockerTop !== undefined) return blockerTop - btnHeight - gap;
    return canvasTop + canvasHeight - btnHeight - gap;
  }

  /** Compute clamped button top from bounds. @param {*} bounds @returns {number} */
  computeTop(bounds) {
    let target = bounds.blockerTop === null || bounds.blockerTop === undefined ? bounds.topMax : bounds.blockerTop - bounds.btnHeight - bounds.gap;
    let max = Math.max(bounds.topMin, bounds.topMax);
    return this.clamp(target, bounds.topMin, max);
  }

  /** Clamp a number to the given range. @param {number} value @param {number} min @param {number} max @returns {number} */
  clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  /** Handle restart button clicks. */
  handleClick() {
    if (this.restarting) return;
    this.restarting = true;
    this.softRestart();
    this.restarting = false;
  }

  /** Run a soft in-place game restart flow. */
  softRestart() {
    this.stopLoops();
    this.resetService.stopEnemySfxSafe();
    this.resetService.resetGameOver();
    this.resetService.restartGame();
    this.resetService.restartGameOverWatcher();
    this.startWatcher();
    this.setVisible(false);
  }

  /** Stop all tracked intervals and RAF callbacks. */
  stopLoops() {
    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.intervalIds.clear();
    this.clearRaf();
    this.watchId = 0;
  }

  /** Cancel any pending position RAF callback. */
  clearRaf() {
    if (!this.rafId) return;
    this.rafCancel(this.rafId);
    this.rafId = 0;
  }

  /** Return the active world instance. @returns {*} */
  getWorld() {
    return this.resetService.getWorld();
  }
};

/** Boot and register the global restart button controller instance. */
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
