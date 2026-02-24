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

/** Initialize end-overlay dependencies and listeners. @param {{getCanvas?:Function,getTarget?:Function}=} deps */
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

/** Ensure animation styles exist in the document head. */
function eplEndOverlayEnsureStyles() {
    if (document.getElementById('game-over-animations')) return;
    document.head.appendChild(eplEndOverlayCreateStyle());
}

/** Create the style node for end-overlay animations. @returns {HTMLStyleElement} */
function eplEndOverlayCreateStyle() {
    let style = document.createElement('style');
    style.id = 'game-over-animations';
    style.textContent = eplEndOverlayGetStyleText();
    return style;
}

/** Reset overlay hint state and remove active hint elements. */
function eplEndOverlayReset() {
    eplEndOverlayRemoveFsHint();
    eplEndOverlayRemoveInlineHint();
    state.lastHintText = null;
    state.active = false;
}

/** Activate hint rendering with the latest hint text. @param {string=} hintText */
function eplEndOverlayActivate(hintText) {
    state.active = true;
    state.lastHintText = hintText || state.lastHintText;
}

/** Sync hint placement with fullscreen and overlay state. */
function eplEndOverlaySync() {
    if (!state.active) { eplEndOverlayRemoveFsHint(); eplEndOverlayRemoveInlineHint(); return; }
    if (document.fullscreenElement) { eplEndOverlayRemoveInlineHint(); eplEndOverlayShowFsHint(state.lastHintText); return; }
    eplEndOverlayRemoveFsHint();
    eplEndOverlayShowInlineHint(state.lastHintText);
}

/** Recompute hints after fullscreen changes. */
function eplEndOverlayOnFullscreenChange() {
    eplEndOverlaySync();
}

/** Show the fullscreen hint with the provided text. @param {string=} text */
function eplEndOverlayShowFsHint(text) {
    state.lastHintText = text || state.lastHintText;
    if (!document.fullscreenElement || !state.lastHintText) return;
    eplEndOverlayEnsureFsHint();
    state.fsHintEl.textContent = state.lastHintText;
    eplEndOverlayAppendFsHint();
}

/** Create the fullscreen hint element when missing. */
function eplEndOverlayEnsureFsHint() {
    if (state.fsHintEl) return;
    state.fsHintEl = document.createElement('div');
    state.fsHintEl.id = 'fs-hint';
    Object.assign(state.fsHintEl.style, { position: 'fixed', left: '50%', bottom: '18px', transform: 'translateX(-50%)', zIndex: '99999', pointerEvents: 'none' });
    eplEndOverlayApplyBaseStyles(state.fsHintEl);
}

/** Append the fullscreen hint to the active fullscreen host. */
function eplEndOverlayAppendFsHint() {
    let canvas = state.getCanvas();
    let host = document.fullscreenElement === canvas ? state.getTarget() : document.fullscreenElement;
    let target = host || document.body;
    if (state.fsHintEl.parentNode === target) return;
    if (state.fsHintEl.parentNode) state.fsHintEl.parentNode.removeChild(state.fsHintEl);
    target.appendChild(state.fsHintEl);
}

/** Remove the fullscreen hint element from the DOM. */
function eplEndOverlayRemoveFsHint() {
    if (!state.fsHintEl || !state.fsHintEl.parentNode) return;
    state.fsHintEl.parentNode.removeChild(state.fsHintEl);
}

/** Show the inline hint outside fullscreen mode. @param {string=} text */
function eplEndOverlayShowInlineHint(text) {
    state.lastHintText = text || state.lastHintText;
    if (document.fullscreenElement || !state.lastHintText) return;
    eplEndOverlayEnsureInlineHint();
    state.inlineHintEl.textContent = state.lastHintText;
    eplEndOverlayAppendInlineHint();
}

/** Create the inline hint element when missing. */
function eplEndOverlayEnsureInlineHint() {
    if (state.inlineHintEl) return;
    state.inlineHintEl = document.createElement('div');
    state.inlineHintEl.id = 'inline-hint';
    Object.assign(state.inlineHintEl.style, { display: 'inline-block', marginTop: '14px', pointerEvents: 'none' });
    eplEndOverlayApplyBaseStyles(state.inlineHintEl);
}

/** Append the inline hint near the game container. */
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

/** Remove the inline hint element from the DOM. */
function eplEndOverlayRemoveInlineHint() {
    if (!state.inlineHintEl || !state.inlineHintEl.parentNode) return;
    state.inlineHintEl.parentNode.removeChild(state.inlineHintEl);
}

/** Apply shared visual styles to a hint element. @param {HTMLElement} el */
function eplEndOverlayApplyBaseStyles(el) {
    Object.assign(el.style, {
        padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.55)', color: '#fff',
        fontFamily: 'Inter, Arial, sans-serif', fontWeight: '700', letterSpacing: '0.6px', boxShadow: '0 10px 20px rgba(0,0,0,0.35)'
    });
}

/** Return inline CSS for game-over animations. @returns {string} */
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
