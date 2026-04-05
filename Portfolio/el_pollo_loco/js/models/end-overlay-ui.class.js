/**
 * @fileoverview
 * End overlay UI utilities for game-over and win states, including fullscreen hints and overlay DOM lifecycle management.
 *
 * Keeps internal UI state on a shared window-backed singleton to avoid duplicate bindings.
 */
{
let root = window.EPL || (window.EPL = {});
let ui = root.UI || (root.UI = {});
let state = window.__epl_end_overlay_state || (window.__epl_end_overlay_state = {
    getCanvas: function() { return null; },
    getTarget: function() { return null; },
    fsHintEl: null,
    inlineHintEl: null,
    lastHintText: null,
    active: false,
    bound: false
});

/**
 * Initializes routine.
 * It is part of the module startup flow.
 * @param {object} deps - Object argument used by this routine.
 */
function eplEndOverlayInit(deps) {
    deps = deps || {};
    state.getCanvas = typeof deps.getCanvas === 'function' ? deps.getCanvas : function() { return null; };
    state.getTarget = typeof deps.getTarget === 'function' ? deps.getTarget : function() { return null; };
    state.fsHintEl = null;
    state.inlineHintEl = null;
    state.lastHintText = null;
    state.active = false;
    if (!state.bound) { state.bound = true; document.addEventListener('fullscreenchange', eplEndOverlayOnFullscreenChange); }
}

/**
 * Ensures styles is available before continuing.
 * The operation is isolated here to keep behavior predictable.
 */
function eplEndOverlayEnsureStyles() {
    if (document.getElementById('game-over-animations')) return;
    document.head.appendChild(eplEndOverlayCreateStyle());
}

/**
 * Creates style.
 * The result is consumed by downstream game logic.
 * @returns {unknown} Returns the value produced by this routine.
 */
function eplEndOverlayCreateStyle() {
    let style = document.createElement('style');
    style.id = 'game-over-animations';
    style.textContent = eplEndOverlayGetStyleText();
    return style;
}

/**
 * Resets routine.
 * The operation is isolated here to keep behavior predictable.
 */
function eplEndOverlayReset() {
    eplEndOverlayRemoveFsHint();
    eplEndOverlayRemoveInlineHint();
    state.lastHintText = null;
    state.active = false;
}

/**
 * Executes the epl end overlay activate routine.
 * The logic is centralized here for maintainability.
 * @param {unknown} hintText - Input value used by this routine.
 */
function eplEndOverlayActivate(hintText) {
    state.active = true;
    state.lastHintText = hintText || state.lastHintText;
}

/**
 * Synchronizes routine.
 * The operation is isolated here to keep behavior predictable.
 */
function eplEndOverlaySync() {
    if (!state.active) { eplEndOverlayRemoveFsHint(); eplEndOverlayRemoveInlineHint(); return; }
    if (document.fullscreenElement) { eplEndOverlayRemoveInlineHint(); eplEndOverlayShowFsHint(state.lastHintText); return; }
    eplEndOverlayRemoveFsHint();
    eplEndOverlayShowInlineHint(state.lastHintText);
}

/**
 * Handles fullscreen change.
 * It applies side effects required by this branch.
 */
function eplEndOverlayOnFullscreenChange() {
    eplEndOverlaySync();
}

/**
 * Shows fs hint.
 * The operation is isolated here to keep behavior predictable.
 * @param {string} text - String value used by this routine.
 */
function eplEndOverlayShowFsHint(text) {
    state.lastHintText = text || state.lastHintText;
    if (!document.fullscreenElement || !state.lastHintText) return;
    eplEndOverlayEnsureFsHint();
    state.fsHintEl.textContent = state.lastHintText;
    eplEndOverlayAppendFsHint();
}

/**
 * Ensures fs hint is available before continuing.
 * The operation is isolated here to keep behavior predictable.
 */
function eplEndOverlayEnsureFsHint() {
    if (state.fsHintEl) return;
    state.fsHintEl = document.createElement('div');
    state.fsHintEl.id = 'fs-hint';
    Object.assign(state.fsHintEl.style, { position: 'fixed', left: '50%', bottom: '18px', transform: 'translateX(-50%)', zIndex: '99999', pointerEvents: 'none' });
    eplEndOverlayApplyBaseStyles(state.fsHintEl);
}

/**
 * Executes the epl end overlay append fs hint routine.
 * The logic is centralized here for maintainability.
 */
function eplEndOverlayAppendFsHint() {
    let canvas = state.getCanvas();
    let host = document.fullscreenElement === canvas ? state.getTarget() : document.fullscreenElement;
    let target = host || document.body;
    if (state.fsHintEl.parentNode === target) return;
    if (state.fsHintEl.parentNode) state.fsHintEl.parentNode.removeChild(state.fsHintEl);
    target.appendChild(state.fsHintEl);
}

/**
 * Executes the epl end overlay remove fs hint routine.
 * The logic is centralized here for maintainability.
 */
function eplEndOverlayRemoveFsHint() {
    if (!state.fsHintEl || !state.fsHintEl.parentNode) return;
    state.fsHintEl.parentNode.removeChild(state.fsHintEl);
}

/**
 * Shows inline hint.
 * The operation is isolated here to keep behavior predictable.
 * @param {string} text - String value used by this routine.
 */
function eplEndOverlayShowInlineHint(text) {
    state.lastHintText = text || state.lastHintText;
    if (document.fullscreenElement || !state.lastHintText) return;
    eplEndOverlayEnsureInlineHint();
    state.inlineHintEl.textContent = state.lastHintText;
    eplEndOverlayAppendInlineHint();
}

/**
 * Ensures inline hint is available before continuing.
 * The operation is isolated here to keep behavior predictable.
 */
function eplEndOverlayEnsureInlineHint() {
    if (state.inlineHintEl) return;
    state.inlineHintEl = document.createElement('div');
    state.inlineHintEl.id = 'inline-hint';
    Object.assign(state.inlineHintEl.style, { display: 'inline-block', marginTop: '14px', pointerEvents: 'none' });
    eplEndOverlayApplyBaseStyles(state.inlineHintEl);
}

/**
 * Executes the epl end overlay append inline hint routine.
 * The logic is centralized here for maintainability.
 */
function eplEndOverlayAppendInlineHint() {
    let canvas = state.getCanvas();
    let host = state.getTarget() || (canvas ? canvas.parentNode : null);
    let parent = (host ? host.parentNode : null) || document.body;
    if (state.inlineHintEl.parentNode !== parent) {
        if (state.inlineHintEl.parentNode) state.inlineHintEl.parentNode.removeChild(state.inlineHintEl);
        parent.appendChild(state.inlineHintEl);
    }
    parent.style.textAlign = 'center';
}

/**
 * Executes the epl end overlay remove inline hint routine.
 * The logic is centralized here for maintainability.
 */
function eplEndOverlayRemoveInlineHint() {
    if (!state.inlineHintEl || !state.inlineHintEl.parentNode) return;
    state.inlineHintEl.parentNode.removeChild(state.inlineHintEl);
}

/**
 * Applies base styles.
 * The operation is isolated here to keep behavior predictable.
 * @param {object} el - Object argument used by this routine.
 */
function eplEndOverlayApplyBaseStyles(el) {
    Object.assign(el.style, {
        padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.55)', color: '#fff',
        fontFamily: 'Inter, Arial, sans-serif', fontWeight: '700', letterSpacing: '0.6px', boxShadow: '0 10px 20px rgba(0,0,0,0.35)'
    });
}

/**
 * Returns the style text.
 * This helper centralizes read access for callers.
 * @returns {string} Returns the resulting string value.
 */
function eplEndOverlayGetStyleText() {
    return '@keyframes gameOverPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes gameOverPulse { 0% { transform: scale(1); } 100% { transform: scale(0.9); } }';
}
if (!ui.EndOverlay) {
    ui.EndOverlay = {
        init: eplEndOverlayInit,
        ensureStyles: eplEndOverlayEnsureStyles,
        reset: eplEndOverlayReset,
        activate: eplEndOverlayActivate,
        sync: eplEndOverlaySync,
        onFullscreenChange: eplEndOverlayOnFullscreenChange
    };
}
}
