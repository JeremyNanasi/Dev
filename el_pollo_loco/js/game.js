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

const controllers = {
    keyboard: null,
    fullscreen: null,
    orientation: null,
    touch: null,
    soundToggle: null
};

function init() {
    canvas = document.getElementById('canvas');
    initControllers();
    fullscreenTarget = controllers.fullscreen.ensureTarget(canvas);
    initEndOverlayUi();
    initPreWorldUI();
    world = new World(canvas, keyboard);
    window.EPL.UI.EndOverlay.ensureStyles();
    startGameOverWatcher();
    resizeCanvas();
    initPostWorldUI();
}

function initEndOverlayUi() {
    window.EPL.UI.EndOverlay.init({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; }
    });
}

function initPreWorldUI() {
    controllers.touch.updateMobileTabletState();
    controllers.touch.setupMediaQuery();
}

function initPostWorldUI() {
    controllers.touch.initOnce();
    controllers.soundToggle.init();
    controllers.touch.setupMobileToggle();
    controllers.orientation.initToggle();
    controllers.orientation.applyStored();
    controllers.touch.updateVisibility();
    initSoundOnGesture();
}

function initControllers() {
    initKeyboardController();
    initFullscreenController();
    initOrientationController();
    initTouchController();
    initSoundToggleController();
}

function initKeyboardController() {
    controllers.keyboard = new window.EPL.Controllers.KeyboardInput({
        getKeyboard: function() { return keyboard; },
        isBossDefeated: isBossDefeated,
        getControlsLocked: function() { return controlsLocked; },
        getEndOverlayShown: function() { return endOverlayShown; },
        navigateToMenu: navigateToMenu
    });
}

function initFullscreenController() {
    controllers.fullscreen = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
}

function initOrientationController() {
    controllers.orientation = new window.EPL.Controllers.Orientation({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        resizeCanvas: resizeCanvas,
        applyContainBaseStyles: function() { controllers.fullscreen.applyContainBaseStyles(); },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        getBreakpoint: function() { return 899; }
    });
}

function initTouchController() {
    controllers.touch = new window.EPL.Controllers.Touch({
        getKeyboard: function() { return keyboard; },
        shouldIgnoreInput: shouldIgnoreInput
    });
}

function initSoundToggleController() {
    controllers.soundToggle = new window.EPL.Controllers.SoundToggle({
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
    controllers.keyboard.attach();
});

function setupFullscreenToggle() {
    controllers.fullscreen = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
    controllers.fullscreen.initToggle();
}

function handleFullscreenChange() {
    updateLayout();
    window.EPL.UI.EndOverlay.onFullscreenChange();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = getCanvasWidth();
    canvas.height = getCanvasHeight();
}

window.addEventListener('resize', updateLayout);
window.addEventListener('resize', function() { if (controllers.touch) controllers.touch.updateVisibility(); });
window.addEventListener('orientationchange', updateLayout);
window.addEventListener('orientationchange', function() { if (controllers.touch) controllers.touch.updateMobileTabletState(); });
window.addEventListener('resize', function() { if (controllers.touch) controllers.touch.updateMobileTabletState(); });

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
    window.EPL.UI.EndOverlay.reset();
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
    window.EPL.UI.EndOverlay.activate(config.hint);
    if (!endOverlayShown) {
        endOverlayShown = true;
        controlsLocked = true;
        resetKeyboard();
    }
    window.EPL.UI.EndOverlay.sync();
}

function resetKeyboard() {
    if (controllers.keyboard) controllers.keyboard.reset();
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
    if (controllers.orientation) controllers.orientation.applyLayout(forcedMode);
}

function setupTouchControls() {
    if (controllers.touch) controllers.touch.initOnce();
}

function setupMobileControlsToggle() {
    if (controllers.touch) controllers.touch.setupMobileToggle();
}

function setupTouchControlsMediaQuery() {
    if (controllers.touch) controllers.touch.setupMediaQuery();
}

function updateTouchControlsVisibility() {
    if (controllers.touch) controllers.touch.updateVisibility();
}

function updateTouchControlsUI() {
    if (controllers.touch) controllers.touch.updateUI();
}

function setupMobileTabletDetection() {
    if (controllers.touch) controllers.touch.updateMobileTabletState();
}

function updateMobileTabletState() {
    if (controllers.touch) return controllers.touch.updateMobileTabletState();
    return false;
}

function setupSoundToggleGame() {
    if (controllers.soundToggle) controllers.soundToggle.init();
}

function setupOrientationToggle() {
    if (controllers.orientation) controllers.orientation.initToggle();
}

function applyStoredOrientation() {
    if (controllers.orientation) controllers.orientation.applyStored();
}

function ensureFullscreenTarget(canvasEl) {
    if (controllers.fullscreen) return controllers.fullscreen.ensureTarget(canvasEl);
    return null;
}

function applyFullscreenContainScale() {
    if (controllers.fullscreen) controllers.fullscreen.applyContainBaseStyles();
}
