window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.__epl_restart_button_controller_class = window.__epl_restart_button_controller_class || class RestartButtonController {
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

  getWatchInterval() {
    return 250;
  }

  getMinRatio() {
    return 0.64;
  }

  getButtonGap() {
    return 12;
  }

  initTimers() {
    this.raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (cb) => window.setTimeout(() => cb(Date.now()), 16);
    this.rafCancel = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : window.clearTimeout;
  }

  bindHandlers() {
    this.onResizeBound = this.onResize.bind(this);
    this.onClickBound = this.handleClick.bind(this);
    this.watchTickBound = this.watchTick.bind(this);
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.resolveElements();
    this.ensureButton();
    this.bindEvents();
    this.startWatcher();
  }

  resolveElements() {
    this.shell = document.getElementById('fullscreen-target');
    this.canvas = document.getElementById('canvas');
    this.overlay = document.querySelector('.game-overlay');
    this.topRight = document.querySelector('.game-overlay__top-right');
    this.bottomControls = document.querySelector('.game-overlay__bottom-controls');
    this.touchControls = document.getElementById('touch-controls');
    this.mobileToggle = document.getElementById('mobile-controls-toggle');
  }

  getContainer() {
    return this.overlay || this.shell;
  }

  ensureButton() {
    var btn;
    var container;
    if (!this.shell || !this.canvas) return;
    container = this.getContainer();
    if (!container) return;
    btn = document.getElementById('restart-button');
    if (!btn) btn = this.createButton();
    if (btn.parentNode !== container) container.appendChild(btn);
    this.button = btn;
    this.button.hidden = true;
  }

  createButton() {
    var btn = document.createElement('button');
    btn.id = 'restart-button';
    btn.type = 'button';
    btn.textContent = 'Neustart';
    btn.addEventListener('click', this.onClickBound);
    return btn;
  }

  bindEvents() {
    window.addEventListener('resize', this.onResizeBound);
    window.addEventListener('orientationchange', this.onResizeBound);
    document.addEventListener('fullscreenchange', this.onResizeBound);
  }

  startWatcher() {
    if (this.watchId) return;
    this.watchId = this.trackInterval(this.watchTickBound, this.getWatchInterval());
    this.watchTick();
  }

  trackInterval(fn, ms) {
    var id = window.setInterval(fn, ms);
    this.intervalIds.add(id);
    return id;
  }

  watchTick() {
    var ended = this.getEndState();
    if (ended !== this.visible) this.setVisible(ended);
  }

  getEndState() {
    var w = this.getWorld();
    var c = w && w.character;
    var dead;
    if (!c) return false;
    dead = c.isDead;
    if (typeof dead === 'function' ? dead.call(c) : dead === true) return true;
    return Boolean(w && w.isBossDefeated && w.isBossDefeated());
  }

  setVisible(show) {
    if (!this.button) return;
    if (this.visible === show) return;
    this.visible = show;
    this.button.hidden = !show;
    if (show) this.schedulePosition();
  }

  schedulePosition() {
    if (!this.visible || this.rafId) return;
    this.rafId = this.raf(() => {
      this.rafId = 0;
      this.position();
    });
  }

  onResize() {
    if (this.visible) this.schedulePosition();
  }

  position() {
    var bounds;
    var top;
    if (!this.button || !this.canvas || !this.shell) return;
    bounds = this.getBounds();
    if (!bounds) return;
    top = this.computeTop(bounds);
    this.button.style.top = top + 'px';
  }

  getBounds() {
    var root = this.shell;
    var container = this.getContainer();
    var containerTop;
    var canvasTop;
    var canvasHeight;
    var btnHeight;
    var gap;
    var blockerTop;
    var localCanvasTop;
    var topMin;
    var topMax;
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

  getScale(shellRect) {
    var raw = this.shell.offsetHeight || shellRect.height || 1;
    var scale = shellRect.height / raw;
    return scale || 1;
  }

  toLocalY(value, shellTop, scale) {
    return (value - shellTop) / scale;
  }

  getRect(el) {
    var rect;
    if (!el) return null;
    rect = el.getBoundingClientRect();
    if (!rect || rect.height === 0 || rect.width === 0) return null;
    return rect;
  }

  getOffsetTop(el, root) {
    var top = 0;
    var node = el;
    if (!el || !root) return null;
    while (node && node !== root) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    if (node !== root) return null;
    return top;
  }

  getTop(el, root, containerTop) {
    var top = this.getOffsetTop(el, root);
    if (top === null) return Infinity;
    return top - containerTop;
  }

  getBottom(el, root, containerTop) {
    var top = this.getOffsetTop(el, root);
    if (top === null) return 0;
    return top - containerTop + (el.offsetHeight || 0);
  }

  getBlockerTop(root, containerTop) {
    var blocker = this.bottomControls || this.mobileToggle;
    var top = this.getOffsetTop(blocker, root);
    if (top === null) return null;
    return top - containerTop;
  }

  getTopMin(canvasTop, canvasHeight, gap, root, containerTop) {
    var base = canvasTop + canvasHeight * this.getMinRatio();
    var topRightBottom = this.getBottom(this.topRight, root, containerTop);
    return Math.max(base, topRightBottom + gap);
  }

  getTopMax(canvasTop, canvasHeight, btnHeight, gap, blockerTop) {
    if (blockerTop !== null && blockerTop !== undefined) return blockerTop - btnHeight - gap;
    return canvasTop + canvasHeight - btnHeight - gap;
  }

  computeTop(bounds) {
    var target = bounds.blockerTop === null || bounds.blockerTop === undefined ? bounds.topMax : bounds.blockerTop - bounds.btnHeight - bounds.gap;
    var max = Math.max(bounds.topMin, bounds.topMax);
    return this.clamp(target, bounds.topMin, max);
  }

  clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  handleClick() {
    if (this.restarting) return;
    this.restarting = true;
    this.softRestart();
    this.restarting = false;
  }

  softRestart() {
    this.stopLoops();
    this.resetService.stopEnemySfxSafe();
    this.resetService.resetGameOver();
    this.resetService.restartGame();
    this.resetService.restartGameOverWatcher();
    this.startWatcher();
    this.setVisible(false);
  }

  stopLoops() {
    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.intervalIds.clear();
    this.clearRaf();
    this.watchId = 0;
  }

  clearRaf() {
    if (!this.rafId) return;
    this.rafCancel(this.rafId);
    this.rafId = 0;
  }

  getWorld() {
    return this.resetService.getWorld();
  }
};

window.__epl_boot_restart_button = window.__epl_boot_restart_button || function() {
  var root = window.EPL || {};
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
