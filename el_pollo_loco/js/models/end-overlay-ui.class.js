(function() {
    window.EPL = window.EPL || {};
    window.EPL.UI = window.EPL.UI || {};
    if (window.EPL.UI.EndOverlay) return;
    /** Gets `getCanvas` data. @returns {*} Result. */
    let getCanvas = function() { return null; };
    /** Gets `getTarget` data. @returns {*} Result. */
    let getTarget = function() { return null; };
    let fsHintEl = null;
    let inlineHintEl = null;
    let lastHintText = null;
    let endOverlayActive = false;
    /** Initializes `init`. @param {*} deps - Value. @returns {*} Result. */
    function init(deps) {
        deps = deps || {};
        getCanvas = typeof deps.getCanvas === 'function' ? deps.getCanvas : function() { return null; };
        getTarget = typeof deps.getTarget === 'function' ? deps.getTarget : function() { return null; };
        fsHintEl = null;
        inlineHintEl = null;
        lastHintText = null;
        endOverlayActive = false;
    }
    /** Runs `ensureStyles`. @returns {*} Result. */
    function ensureStyles() {
        if (document.getElementById('game-over-animations')) return;
        let style = document.createElement('style');
        style.id = 'game-over-animations';
        style.textContent = getStyleText();
        document.head.appendChild(style);
    }
    /** Runs `reset`. */
    function reset() {
        removeFullscreenHint();
        removeInlineHint();
        lastHintText = null;
        endOverlayActive = false;
    }
    /** Runs `activate`. @param {*} hintText - Value. */
    function activate(hintText) {
        endOverlayActive = true;
        lastHintText = hintText || lastHintText;
    }
    /** Runs `sync`. */
    function sync() {
        if (!endOverlayActive) {
            removeFullscreenHint();
            removeInlineHint();
            return;
        }
        if (document.fullscreenElement) {
            removeInlineHint();
            showFullscreenHint(lastHintText);
            return;
        }
        removeFullscreenHint();
        showInlineHint(lastHintText);
    }
    /** Runs `onFullscreenChange`. */
    function onFullscreenChange() {
        sync();
    }
    /** Runs `showFullscreenHint`. @param {*} text - Value. @returns {*} Result. */
    function showFullscreenHint(text) {
        lastHintText = text || lastHintText;
        if (!document.fullscreenElement || !lastHintText) return;
        if (!fsHintEl) fsHintEl = createFsHintEl();
        fsHintEl.textContent = lastHintText;
        appendFsHint();
    }
    /** Creates `createFsHintEl` data. @returns {*} Result. */
    function createFsHintEl() {
        let el = document.createElement('div');
        el.id = 'fs-hint';
        Object.assign(el.style, {
            position: 'fixed',
            left: '50%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            zIndex: '99999',
            pointerEvents: 'none'
        });
        buildHintBaseStyles(el);
        return el;
    }
    /** Runs `appendFsHint`. */
    function appendFsHint() {
        let canvas = getCanvas();
        let host = document.fullscreenElement === canvas ? getTarget() : document.fullscreenElement;
        let target = host || document.body;
        if (fsHintEl.parentNode !== target) {
            fsHintEl.remove();
            target.appendChild(fsHintEl);
        }
    }
    /** Runs `removeFullscreenHint`. */
    function removeFullscreenHint() {
        if (fsHintEl && fsHintEl.parentNode) fsHintEl.parentNode.removeChild(fsHintEl);
    }
    /** Runs `showInlineHint`. @param {*} text - Value. @returns {*} Result. */
    function showInlineHint(text) {
        lastHintText = text || lastHintText;
        if (document.fullscreenElement || !lastHintText) return;
        if (!inlineHintEl) inlineHintEl = createInlineHintEl();
        inlineHintEl.textContent = lastHintText;
        appendInlineHint();
    }
    /** Creates `createInlineHintEl` data. @returns {*} Result. */
    function createInlineHintEl() {
        let el = document.createElement('div');
        el.id = 'inline-hint';
        Object.assign(el.style, { display: 'inline-block', marginTop: '14px', pointerEvents: 'none' });
        buildHintBaseStyles(el);
        return el;
    }
    /** Runs `appendInlineHint`. */
    function appendInlineHint() {
        let canvas = getCanvas();
        let host = getTarget() || (canvas ? canvas.parentNode : null);
        let parent = (host ? host.parentNode : null) || document.body;
        if (!inlineHintEl.parentNode || inlineHintEl.parentNode !== parent) {
            inlineHintEl.remove();
            parent.appendChild(inlineHintEl);
        }
        parent.style.textAlign = 'center';
    }
    /** Runs `removeInlineHint`. */
    function removeInlineHint() {
        if (inlineHintEl && inlineHintEl.parentNode) inlineHintEl.parentNode.removeChild(inlineHintEl);
    }
    /** Creates `buildHintBaseStyles` data. @param {*} el - Value. */
    function buildHintBaseStyles(el) {
        Object.assign(el.style, {
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: '700',
            letterSpacing: '0.6px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.35)'
        });
    }
    /** Gets `getStyleText` data. @returns {*} Result. */
    function getStyleText() {
        return '@keyframes gameOverPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes gameOverPulse { 0% { transform: scale(1); } 100% { transform: scale(0.9); } }';
    }

    window.EPL.UI.EndOverlay = {
        init: init,
        ensureStyles: ensureStyles,
        reset: reset,
        activate: activate,
        sync: sync,
        onFullscreenChange: onFullscreenChange
    };
})();
