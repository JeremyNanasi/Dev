let canvas;
let world;
let keyboard = new Keyboard();
let fullscreenTarget;
let gameStarted = false;
let gameOverShown = false;
let gameOverOverlay;
let controlsLocked = false;
let endOverlayShown = false;
let endOverlayElement;
let fsHintEl = null;
let inlineHintEl = null;
let lastHintText = null;
let endOverlayActive = false;

let keyboardController;
let fullscreenController;
let orientationController;
let touchController;
let soundToggleController;

let GAME_OVER_STYLE_ID = 'game-over-animations';

function init() {
    canvas = document.getElementById('canvas');
    initControllers();
    fullscreenTarget = fullscreenController.ensureTarget(canvas);
    touchController.updateMobileTabletState();
    touchController.setupMediaQuery();
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
    resizeCanvas();
    touchController.initOnce();
    soundToggleController.init();
    touchController.setupMobileToggle();
    orientationController.initToggle();
    orientationController.applyStored();
    touchController.updateVisibility();
    initSoundOnGesture();
}

function initControllers() {
    keyboardController = new window.EPL.Controllers.KeyboardInput({
        getKeyboard: function() { return keyboard; },
        isBossDefeated: isBossDefeated,
        getControlsLocked: function() { return controlsLocked; },
        getEndOverlayShown: function() { return endOverlayShown; },
        navigateToMenu: navigateToMenu
    });
    fullscreenController = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
    orientationController = new window.EPL.Controllers.Orientation({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        resizeCanvas: resizeCanvas,
        applyContainBaseStyles: function() { fullscreenController.applyContainBaseStyles(); },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        getBreakpoint: function() { return 899; }
    });
    touchController = new window.EPL.Controllers.Touch({
        getKeyboard: function() { return keyboard; },
        shouldIgnoreInput: shouldIgnoreInput
    });
    soundToggleController = new window.EPL.Controllers.SoundToggle({
        soundManager: window.EPL.Sound
    });
}

function getCanvasWidth() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_WIDTH ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
}

function getCanvasHeight() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_HEIGHT ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
}

function initSoundOnGesture() {
    let handler = function() {
        if (window.EPL && window.EPL.Sound) window.EPL.Sound.tryPlayOnGesture();
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
}

window.showWinOverlay = function() {
    showEndOverlay({ hint: ' Enter  zurück zum Menü' });
};

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('game-container')?.classList.remove('hidden');
    init();
}

function shouldStartGame() {
    let params = new URLSearchParams(window.location.search);
    return params.get('start') === '1';
}

function redirectToMenu() {
    window.location.replace('menu.html');
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.EPL && window.EPL.Sound) window.EPL.Sound.init();
    if (!shouldStartGame()) {
        redirectToMenu();
        return;
    }
    setupFullscreenToggle();
    startGame();
    keyboardController.attach();
});

function setupFullscreenToggle() {
    fullscreenController = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
    fullscreenController.initToggle();
}

function handleFullscreenChange() {
    updateLayout();
    syncHints();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = getCanvasWidth();
    canvas.height = getCanvasHeight();
}

window.addEventListener('resize', updateLayout);
window.addEventListener('resize', function() { if (touchController) touchController.updateVisibility(); });
window.addEventListener('orientationchange', updateLayout);
window.addEventListener('orientationchange', function() { if (touchController) touchController.updateMobileTabletState(); });
window.addEventListener('resize', function() { if (touchController) touchController.updateMobileTabletState(); });

function startGameOverWatcher() {
    resetGameOverState();
    let loop = function() {
        let status = getGameOverStatus();
        handleGameOverStatus(status);
        if (!endOverlayShown) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

function resetGameOverState() {
    if (endOverlayElement) endOverlayElement.remove();
    removeFullscreenHint();
    removeInlineHint();
    lastHintText = null;
    endOverlayActive = false;
    gameOverOverlay = null;
    endOverlayElement = null;
    gameOverShown = false;
    endOverlayShown = false;
    controlsLocked = false;
    resetKeyboard();
}

function getGameOverStatus() {
    if (world?.character?.isDead?.()) return 'dead';
    let boss = getBoss();
    if (isBossDefeatedCheck(boss)) return 'bossDefeated';
    return null;
}

function getBoss() {
    return world?.level?.enemies?.find(function(e) { return e instanceof Endboss; });
}

function isBossDefeatedCheck(boss) {
    return boss && (boss.isDeadState || boss.energy <= 0);
}

function handleGameOverStatus(status) {
    if (status === 'dead') { handlePlayerDead(); return; }
    if (status === 'bossDefeated') handleBossDefeated();
}

function handlePlayerDead() {
    if (endOverlayShown) return;
    triggerGameOverOverlay();
    controlsLocked = true;
}

function handleBossDefeated() {
    if (endOverlayShown) return;
    showEndOverlay(getBossDefeatedOverlayConfig());
    controlsLocked = true;
    endOverlayShown = true;
}

function getBossDefeatedOverlayConfig() {
    return {
        imgSrc: './img/You won, you lost/You Win A.png',
        alt: 'You Won',
        hint: ' Enter  zurück zum Menü',
        fit: 'contain',
        width: '85vw',
        height: '85vh',
        maxWidth: '900px',
        maxHeight: '600px'
    };
}

function triggerGameOverOverlay() {
    if (endOverlayShown || gameOverOverlay) return;
    showEndOverlay({
        imgSrc: './img/9_intro_outro_screens/game_over/game over.png',
        alt: 'Game Over',
        hint: ' Enter  zurück zum Menü'
    });
    gameOverShown = true;
    endOverlayShown = true;
}

function showEndOverlay(config) {
    config = config || {};
    lastHintText = config.hint || lastHintText;
    endOverlayActive = true;
    if (!endOverlayShown) {
        endOverlayShown = true;
        controlsLocked = true;
        resetKeyboard();
    }
    syncHintsForOverlay();
}

function syncHintsForOverlay() {
    if (document.fullscreenElement) {
        removeInlineHint();
        showFullscreenHint(lastHintText);
    } else {
        removeFullscreenHint();
        showInlineHint(lastHintText);
    }
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
    lastHintText = text || lastHintText;
    if (!document.fullscreenElement || !lastHintText) return;
    if (!fsHintEl) fsHintEl = createFsHintEl();
    fsHintEl.textContent = lastHintText;
    appendFsHint();
}

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

function appendFsHint() {
    let host = document.fullscreenElement === canvas ? fullscreenTarget : document.fullscreenElement;
    let target = host || document.body;
    if (fsHintEl.parentNode !== target) {
        fsHintEl.remove();
        target.appendChild(fsHintEl);
    }
}

function removeFullscreenHint() {
    if (fsHintEl && fsHintEl.parentNode) fsHintEl.parentNode.removeChild(fsHintEl);
}

function showInlineHint(text) {
    lastHintText = text || lastHintText;
    if (document.fullscreenElement || !lastHintText) return;
    if (!inlineHintEl) inlineHintEl = createInlineHintEl();
    inlineHintEl.textContent = lastHintText;
    appendInlineHint();
}

function createInlineHintEl() {
    let el = document.createElement('div');
    el.id = 'inline-hint';
    Object.assign(el.style, { display: 'inline-block', marginTop: '14px', pointerEvents: 'none' });
    buildHintBaseStyles(el);
    return el;
}

function appendInlineHint() {
    let host = fullscreenTarget || (canvas ? canvas.parentNode : null);
    let parent = (host ? host.parentNode : null) || document.body;
    if (!inlineHintEl.parentNode) {
        parent.appendChild(inlineHintEl);
        parent.style.textAlign = 'center';
    } else if (inlineHintEl.parentNode !== parent) {
        inlineHintEl.remove();
        parent.appendChild(inlineHintEl);
        parent.style.textAlign = 'center';
    }
}

function removeInlineHint() {
    if (inlineHintEl && inlineHintEl.parentNode) inlineHintEl.parentNode.removeChild(inlineHintEl);
}

function syncHints() {
    if (!endOverlayActive) {
        removeFullscreenHint();
        removeInlineHint();
        return;
    }
    syncHintsForOverlay();
}

function resetKeyboard() {
    if (keyboardController) keyboardController.reset();
}

function ensureGameOverStyles() {
    if (document.getElementById(GAME_OVER_STYLE_ID)) return;
    let style = document.createElement('style');
    style.id = GAME_OVER_STYLE_ID;
    style.textContent = getGameOverStyleText();
    document.head.appendChild(style);
}

function getGameOverStyleText() {
    return '@keyframes gameOverPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes gameOverPulse { 0% { transform: scale(1); } 100% { transform: scale(0.9); } }';
}

window.showGameOverOverlay = triggerGameOverOverlay;

function shouldIgnoreInput() {
    return isBossDefeated() || controlsLocked;
}

function isBossDefeated() {
    return world?.isBossDefeated?.();
}

function navigateToMenu() {
    window.location.href = 'menu.html';
}

function updateLayout(forcedMode) {
    if (orientationController) orientationController.applyLayout(forcedMode);
}

function setupTouchControls() {
    if (touchController) touchController.initOnce();
}

function setupMobileControlsToggle() {
    if (touchController) touchController.setupMobileToggle();
}

function setupTouchControlsMediaQuery() {
    if (touchController) touchController.setupMediaQuery();
}

function updateTouchControlsVisibility() {
    if (touchController) touchController.updateVisibility();
}

function updateTouchControlsUI() {
    if (touchController) touchController.updateUI();
}

function setupMobileTabletDetection() {
    if (touchController) touchController.updateMobileTabletState();
}

function updateMobileTabletState() {
    if (touchController) return touchController.updateMobileTabletState();
    return false;
}

function setupSoundToggleGame() {
    if (soundToggleController) soundToggleController.init();
}

function setupOrientationToggle() {
    if (orientationController) orientationController.initToggle();
}

function applyStoredOrientation() {
    if (orientationController) orientationController.applyStored();
}

function ensureFullscreenTarget(canvasEl) {
    if (fullscreenController) return fullscreenController.ensureTarget(canvasEl);
    return null;
}

function applyFullscreenContainScale() {
    if (fullscreenController) fullscreenController.applyContainBaseStyles();
}
