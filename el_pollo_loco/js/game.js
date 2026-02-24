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

/** Initializes `init`. */
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

/** Initializes `initEndOverlayUi`. @returns {*} Result. */
function initEndOverlayUi() {
    window.EPL.UI.EndOverlay.init({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; }
    });
}

/** Initializes `initPreWorldUI`. */
function initPreWorldUI() {
    controllers.touch.updateMobileTabletState();
    controllers.touch.setupMediaQuery();
}

/** Initializes `initPostWorldUI`. */
function initPostWorldUI() {
    controllers.touch.initOnce();
    controllers.soundToggle.init();
    controllers.touch.setupMobileToggle();
    controllers.orientation.initToggle();
    controllers.orientation.applyStored();
    controllers.touch.updateVisibility();
    initSoundOnGesture();
}

/** Initializes `initControllers`. */
function initControllers() {
    initKeyboardController();
    initFullscreenController();
    initOrientationController();
    initTouchController();
    initSoundToggleController();
}

/** Initializes `initKeyboardController`. @returns {*} Result. */
function initKeyboardController() {
    controllers.keyboard = new window.EPL.Controllers.KeyboardInput({
        getKeyboard: function() { return keyboard; },
        isBossDefeated: isBossDefeated,
        getControlsLocked: function() { return controlsLocked; },
        getEndOverlayShown: function() { return endOverlayShown; },
        navigateToMenu: navigateToMenu
    });
}

/** Initializes `initFullscreenController`. @returns {*} Result. */
function initFullscreenController() {
    controllers.fullscreen = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
}

/** Initializes `initOrientationController`. @returns {*} Result. */
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

/** Initializes `initTouchController`. @returns {*} Result. */
function initTouchController() {
    controllers.touch = new window.EPL.Controllers.Touch({
        getKeyboard: function() { return keyboard; },
        shouldIgnoreInput: shouldIgnoreInput
    });
}

/** Initializes `initSoundToggleController`. */
function initSoundToggleController() {
    controllers.soundToggle = new window.EPL.Controllers.SoundToggle({
        soundManager: window.EPL.Sound
    });
}

/** Gets `getCanvasWidth` data. @returns {*} Result. */
function getCanvasWidth() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_WIDTH ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
}

/** Gets `getCanvasHeight` data. @returns {*} Result. */
function getCanvasHeight() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_HEIGHT ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
}

/** Initializes `initSoundOnGesture`. */
function initSoundOnGesture() {
    /** Handles `handler`. */
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

/** Runs `startGame`. @returns {*} Result. */
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('game-container')?.classList.remove('hidden');
    init();
}

/** Checks `shouldStartGame`. @returns {*} Result. */
function shouldStartGame() {
    let params = new URLSearchParams(window.location.search);
    return params.get('start') === '1';
}

/** Runs `redirectToMenu`. */
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

/** Sets `setupFullscreenToggle` state. @returns {*} Result. */
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

/** Handles `handleFullscreenChange`. */
function handleFullscreenChange() {
    updateLayout();
    window.EPL.UI.EndOverlay.onFullscreenChange();
}

/** Runs `resizeCanvas`. @returns {*} Result. */
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
/** Runs `startGameOverWatcher`. */
function startGameOverWatcher() {
    resetGameOverState();
    /** Runs `loop`. */
    let loop = function() {
        let status = getGameOverStatus();
        handleGameOverStatus(status);
        if (!endOverlayShown) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

/** Runs `resetGameOverState`. */
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

/** Gets `getGameOverStatus` data. @returns {*} Result. */
function getGameOverStatus() {
    if (world?.character?.isDead?.()) return 'dead';
    let boss = getBoss();
    if (isBossDefeatedCheck(boss)) return 'bossDefeated';
    return null;
}

/** Gets `getBoss` data. @returns {*} Result. */
function getBoss() {
    return world?.level?.enemies?.find(function(e) { return e instanceof Endboss; });
}

/** Checks `isBossDefeatedCheck`. @param {*} boss - Value. @returns {*} Result. */
function isBossDefeatedCheck(boss) {
    return boss && (boss.isDeadState || boss.energy <= 0);
}

/** Handles `handleGameOverStatus`. @param {*} status - Value. @returns {*} Result. */
function handleGameOverStatus(status) {
    if (status === 'dead') { handlePlayerDead(); return; }
    if (status === 'bossDefeated') handleBossDefeated();
}

/** Handles `handlePlayerDead`. @returns {*} Result. */
function handlePlayerDead() {
    if (endOverlayShown) return;
    triggerGameOverOverlay();
    controlsLocked = true;
}

/** Handles `handleBossDefeated`. @returns {*} Result. */
function handleBossDefeated() {
    if (endOverlayShown) return;
    showEndOverlay(getBossDefeatedOverlayConfig());
    controlsLocked = true;
    endOverlayShown = true;
}

/** Gets `getBossDefeatedOverlayConfig` data. @returns {*} Result. */
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

/** Runs `triggerGameOverOverlay`. @returns {*} Result. */
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

/** Runs `showEndOverlay`. @param {*} config - Value. */
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

/** Runs `resetKeyboard`. */
function resetKeyboard() {
    if (controllers.keyboard) controllers.keyboard.reset();
}

window.showGameOverOverlay = triggerGameOverOverlay;
/** Checks `shouldIgnoreInput`. @returns {*} Result. */
function shouldIgnoreInput() {
    return isBossDefeated() || controlsLocked;
}

/** Checks `isBossDefeated`. @returns {*} Result. */
function isBossDefeated() {
    return world?.isBossDefeated?.();
}

/** Runs `navigateToMenu`. */
function navigateToMenu() {
    window.location.href = 'menu.html';
}

/** Updates `updateLayout` state. @param {*} forcedMode - Value. */
function updateLayout(forcedMode) {
    if (controllers.orientation) controllers.orientation.applyLayout(forcedMode);
}

/** Sets `setupTouchControls` state. */
function setupTouchControls() {
    if (controllers.touch) controllers.touch.initOnce();
}

/** Sets `setupMobileControlsToggle` state. */
function setupMobileControlsToggle() {
    if (controllers.touch) controllers.touch.setupMobileToggle();
}

/** Sets `setupTouchControlsMediaQuery` state. */
function setupTouchControlsMediaQuery() {
    if (controllers.touch) controllers.touch.setupMediaQuery();
}

/** Updates `updateTouchControlsVisibility` state. */
function updateTouchControlsVisibility() {
    if (controllers.touch) controllers.touch.updateVisibility();
}

/** Updates `updateTouchControlsUI` state. */
function updateTouchControlsUI() {
    if (controllers.touch) controllers.touch.updateUI();
}

/** Sets `setupMobileTabletDetection` state. */
function setupMobileTabletDetection() {
    if (controllers.touch) controllers.touch.updateMobileTabletState();
}

/** Updates `updateMobileTabletState` state. @returns {*} Result. */
function updateMobileTabletState() {
    if (controllers.touch) return controllers.touch.updateMobileTabletState();
    return false;
}

/** Sets `setupSoundToggleGame` state. */
function setupSoundToggleGame() {
    if (controllers.soundToggle) controllers.soundToggle.init();
}

/** Sets `setupOrientationToggle` state. */
function setupOrientationToggle() {
    if (controllers.orientation) controllers.orientation.initToggle();
}

/** Runs `applyStoredOrientation`. */
function applyStoredOrientation() {
    if (controllers.orientation) controllers.orientation.applyStored();
}

/** Runs `ensureFullscreenTarget`. @param {*} canvasEl - Value. @returns {*} Result. */
function ensureFullscreenTarget(canvasEl) {
    if (controllers.fullscreen) return controllers.fullscreen.ensureTarget(canvasEl);
    return null;
}

/** Runs `applyFullscreenContainScale`. */
function applyFullscreenContainScale() {
    if (controllers.fullscreen) controllers.fullscreen.applyContainBaseStyles();
}
