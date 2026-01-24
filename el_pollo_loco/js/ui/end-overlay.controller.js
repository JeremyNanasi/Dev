(() => {
    const root = window.EPL || (window.EPL = {});
    const state = {
        deps: null,
        gameOverOverlay: null,
        endOverlayElement: null
    };

    function init(deps) {
        state.deps = deps;
        ensureGameOverStyles();
        bindWindowExports();
    }

    function bindWindowExports() {
        window.showGameOverOverlay = triggerGameOverOverlay;
        window.showWinOverlay = showWinOverlay;
    }

    function startWatcher() {
        resetGameOverState();
        requestAnimationFrame(watchLoop);
    }

    function watchLoop() {
        handleGameOverStatus(getGameOverStatus());
        if (!call('getEndOverlayShown')) {
            requestAnimationFrame(watchLoop);
        }
    }

    function resetGameOverState() {
        removeOverlayElement();
        clearHints();
        resetOverlayFlags();
        call('resetKeyboard');
    }

    function removeOverlayElement() {
        if (state.endOverlayElement) {
            state.endOverlayElement.remove();
        }
        state.gameOverOverlay = null;
        state.endOverlayElement = null;
    }

    function clearHints() {
        removeFullscreenHint();
        removeInlineHint();
        call('setLastHintText', null);
        call('setEndOverlayActive', false);
    }

    function resetOverlayFlags() {
        call('setGameOverShown', false);
        call('setEndOverlayShown', false);
        call('setControlsLocked', false);
    }

    function getGameOverStatus() {
        if (call('getWorld')?.character?.isDead?.()) {
            return 'dead';
        }
        const boss = getBoss();
        return isBossDefeated(boss) ? 'bossDefeated' : null;
    }

    function getBoss() {
        return call('getWorld')?.level?.enemies?.find((enemy) => enemy instanceof Endboss);
    }

    function isBossDefeated(boss) {
        return boss && (boss.isDeadState || boss.energy <= 0);
    }

    function handleGameOverStatus(status) {
        if (status === 'dead') {
            handlePlayerDead();
            return;
        }
        if (status === 'bossDefeated') {
            handleBossDefeated();
        }
    }

    function handlePlayerDead() {
        if (call('getEndOverlayShown')) {
            return;
        }
        triggerGameOverOverlay();
        call('setControlsLocked', true);
    }

    function handleBossDefeated() {
        if (call('getEndOverlayShown')) {
            return;
        }
        showEndOverlay(getBossDefeatedOverlayConfig());
        call('setControlsLocked', true);
        call('setEndOverlayShown', true);
    }

    function getBossDefeatedOverlayConfig() {
        return {
            imgSrc: './img/You won, you lost/You Win A.png',
            alt: 'You Won',
            hint: ' Enter  zur?ck zum Men?',
            fit: 'contain',
            width: '85vw',
            height: '85vh',
            maxWidth: '900px',
            maxHeight: '600px'
        };
    }

    function triggerGameOverOverlay() {
        if (call('getEndOverlayShown') || state.gameOverOverlay) {
            return;
        }
        showEndOverlay(getGameOverOverlayConfig());
        call('setGameOverShown', true);
        call('setEndOverlayShown', true);
    }

    function getGameOverOverlayConfig() {
        return {
            imgSrc: './img/9_intro_outro_screens/game_over/game over.png',
            alt: 'Game Over',
            hint: ' Enter  zur?ck zum Men?'
        };
    }

    function showEndOverlay(config = {}) {
        const hint = resolveHint(config);
        activateOverlay(hint);
        renderHint(hint);
    }

    function resolveHint(config) {
        return config.hint || call('getLastHintText');
    }

    function activateOverlay(hint) {
        call('setLastHintText', hint);
        call('setEndOverlayActive', true);
        lockControlsIfNeeded();
    }

    function lockControlsIfNeeded() {
        if (call('getEndOverlayShown')) {
            return;
        }
        call('setEndOverlayShown', true);
        call('setControlsLocked', true);
        call('resetKeyboard');
    }

    function renderHint(hint) {
        if (document.fullscreenElement) {
            renderFullscreenHint(hint);
            return;
        }
        renderInlineHint(hint);
    }

    function renderFullscreenHint(hint) {
        removeInlineHint();
        showFullscreenHint(hint);
    }

    function renderInlineHint(hint) {
        removeFullscreenHint();
        showInlineHint(hint);
    }

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

    function showFullscreenHint(text) {
        const hintText = cacheHintText(text);
        if (!document.fullscreenElement || !hintText) {
            return;
        }
        const hintEl = ensureFullscreenHintElement();
        hintEl.textContent = hintText;
        updateFullscreenHintParent(hintEl);
    }

    function cacheHintText(text) {
        const hintText = text || call('getLastHintText');
        call('setLastHintText', hintText);
        return hintText;
    }

    function updateFullscreenHintParent(hintEl) {
        const host = getFullscreenHintHost();
        const target = host || document.body;
        if (hintEl.parentNode !== target) {
            hintEl.remove();
            target.appendChild(hintEl);
        }
    }

    function getFullscreenHintHost() {
        const canvas = call('getCanvas');
        if (document.fullscreenElement === canvas) {
            return call('getFullscreenTarget');
        }
        return document.fullscreenElement;
    }

    function ensureFullscreenHintElement() {
        const existing = call('getFsHintEl');
        if (existing) {
            return existing;
        }
        const hintEl = document.createElement('div');
        setFullscreenHintStyles(hintEl);
        call('setFsHintEl', hintEl);
        return hintEl;
    }

    function setFullscreenHintStyles(hintEl) {
        hintEl.id = 'fs-hint';
        Object.assign(hintEl.style, {
            position: 'fixed',
            left: '50%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            zIndex: '99999',
            pointerEvents: 'none'
        });
        buildHintBaseStyles(hintEl);
    }

    function removeFullscreenHint() {
        const hintEl = call('getFsHintEl');
        if (hintEl && hintEl.parentNode) {
            hintEl.parentNode.removeChild(hintEl);
        }
    }

    function showInlineHint(text) {
        const hintText = cacheHintText(text);
        if (document.fullscreenElement || !hintText) {
            return;
        }
        const hintEl = ensureInlineHintElement();
        hintEl.textContent = hintText;
        updateInlineHintParent(hintEl);
    }

    function updateInlineHintParent(hintEl) {
        const parent = getInlineHintParent();
        if (!hintEl.parentNode) {
            parent.appendChild(hintEl);
            parent.style.textAlign = 'center';
            return;
        }
        if (hintEl.parentNode !== parent) {
            hintEl.remove();
            parent.appendChild(hintEl);
            parent.style.textAlign = 'center';
        }
    }

    function getInlineHintParent() {
        const host = call('getFullscreenTarget') || call('getCanvas')?.parentNode;
        return host?.parentNode || document.body;
    }

    function ensureInlineHintElement() {
        const existing = call('getInlineHintEl');
        if (existing) {
            return existing;
        }
        const hintEl = document.createElement('div');
        setInlineHintStyles(hintEl);
        call('setInlineHintEl', hintEl);
        return hintEl;
    }

    function setInlineHintStyles(hintEl) {
        hintEl.id = 'inline-hint';
        Object.assign(hintEl.style, {
            display: 'inline-block',
            marginTop: '14px',
            pointerEvents: 'none'
        });
        buildHintBaseStyles(hintEl);
    }

    function removeInlineHint() {
        const hintEl = call('getInlineHintEl');
        if (hintEl && hintEl.parentNode) {
            hintEl.parentNode.removeChild(hintEl);
        }
    }

    function syncHints() {
        if (!call('getEndOverlayActive')) {
            removeFullscreenHint();
            removeInlineHint();
            return;
        }
        if (document.fullscreenElement) {
            removeInlineHint();
            showFullscreenHint();
            return;
        }
        removeFullscreenHint();
        showInlineHint();
    }

    function ensureGameOverStyles() {
        if (document.getElementById(call('getGameOverStyleId'))) {
            return;
        }
        const style = buildGameOverStyleElement();
        document.head.appendChild(style);
    }

    function buildGameOverStyleElement() {
        const style = document.createElement('style');
        style.id = call('getGameOverStyleId');
        style.textContent = getGameOverStyleText();
        return style;
    }

    function getGameOverStyleText() {
        return `
        @keyframes gameOverPop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gameOverPulse {
            0% { transform: scale(1); }
            100% { transform: scale(0.9); }
        }
    `;
    }

    function showWinOverlay() {
        showEndOverlay({ hint: ' Enter  zur?ck zum Men?' });
    }

    function call(name, ...args) {
        return state.deps?.[name]?.(...args);
    }

    root.EndOverlay = {
        init,
        startWatcher,
        syncHints,
        triggerGameOverOverlay,
        showWinOverlay
    };
})();
