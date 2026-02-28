/**
 * @fileoverview
 * Main game entrypoint that wires the canvas, creates the world, initializes controllers and UI, and starts the game flow.
 *
 * Responsible for bootstrapping runtime dependencies and coordinating start/restart behavior.
 */

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
/**
 * Initializes routine.
 * It is part of the module startup flow.
 */
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

/**
 * Initializes end overlay UI.
 * It is part of the module startup flow.
 */
function initEndOverlayUi() {
    window.EPL.UI.EndOverlay.init({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; }
    });
}

/**
 * Initializes pre world UI.
 * It is part of the module startup flow.
 */
function initPreWorldUI() {
    controllers.touch.updateMobileTabletState();
    controllers.touch.setupMediaQuery();
}

/**
 * Initializes post world UI.
 * It is part of the module startup flow.
 */
function initPostWorldUI() {
    controllers.touch.initOnce();
    controllers.soundToggle.init();
    controllers.touch.setupMobileToggle();
    controllers.orientation.initToggle();
    controllers.orientation.applyStored();
    controllers.touch.updateVisibility();
    initSoundOnGesture();
}

/**
 * Initializes controllers.
 * It is part of the module startup flow.
 */
function initControllers() {
    initKeyboardController();
    initFullscreenController();
    initOrientationController();
    initTouchController();
    initSoundToggleController();
}

/**
 * Initializes keyboard controller.
 * It is part of the module startup flow.
 */
function initKeyboardController() {
    controllers.keyboard = new window.EPL.Controllers.KeyboardInput({
        getKeyboard: function() { return keyboard; },
        isBossDefeated: isBossDefeated,
        getControlsLocked: function() { return controlsLocked; },
        getEndOverlayShown: function() { return endOverlayShown; },
        navigateToMenu: navigateToMenu
    });
}

/**
 * Initializes fullscreen controller.
 * It is part of the module startup flow.
 */
function initFullscreenController() {
    controllers.fullscreen = new window.EPL.Controllers.Fullscreen({
        getCanvas: function() { return canvas; },
        getTarget: function() { return fullscreenTarget; },
        getCanvasWidth: getCanvasWidth,
        getCanvasHeight: getCanvasHeight,
        onFullscreenChange: handleFullscreenChange
    });
}

/**
 * Initializes orientation controller.
 * It is part of the module startup flow.
 */
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

/**
 * Initializes touch controller.
 * It is part of the module startup flow.
 */
function initTouchController() {
    controllers.touch = new window.EPL.Controllers.Touch({
        getKeyboard: function() { return keyboard; },
        shouldIgnoreInput: shouldIgnoreInput
    });
}

/**
 * Initializes sound toggle controller.
 * It is part of the module startup flow.
 */
function initSoundToggleController() {
    controllers.soundToggle = new window.EPL.Controllers.SoundToggle({
        soundManager: window.EPL.Sound
    });
}

/**
 * Returns the canvas width.
 * This helper centralizes read access for callers.
 * @returns {number} Returns the computed numeric value.
 */
function getCanvasWidth() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_WIDTH ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
}

/**
 * Returns the canvas height.
 * This helper centralizes read access for callers.
 * @returns {number} Returns the computed numeric value.
 */
function getCanvasHeight() {
    return window.EPL && window.EPL.DEFAULT_CANVAS_HEIGHT ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
}

/**
 * Initializes sound on gesture.
 * It is part of the module startup flow.
 */
function initSoundOnGesture() {
    /**
     * Executes the handler routine.
     * The logic is centralized here for maintainability.
     */
    let handler = function() {
        if (window.EPL && window.EPL.Sound) window.EPL.Sound.tryPlayOnGesture();
        document.removeEventListener('click', handler);
        document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
}

/**
 * Shows win overlay.
 * The operation is isolated here to keep behavior predictable.
 */
window.showWinOverlay = function() {
    showEndOverlay({ hint: ' Enter  zurück zum Menü' });
};

/**
 * Starts game.
 * The operation is isolated here to keep behavior predictable.
 */
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('game-container')?.classList.remove('hidden');
    init();
}

/**
 * Evaluates the start game condition.
 * Returns whether the current runtime state satisfies that condition.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function shouldStartGame() {
    let params = new URLSearchParams(window.location.search);
    return params.get('start') === '1';
}

/**
 * Executes the redirect to menu routine.
 * The logic is centralized here for maintainability.
 */
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

/**
 * Initializes fullscreen toggle.
 * It is part of the module startup flow.
 */
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

/**
 * Handles fullscreen change.
 * It applies side effects required by this branch.
 */
function handleFullscreenChange() {
    updateLayout();
    window.EPL.UI.EndOverlay.onFullscreenChange();
}

/**
 * Executes the resize canvas routine.
 * The logic is centralized here for maintainability.
 */
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

/**
 * Starts game over watcher.
 * The operation is isolated here to keep behavior predictable.
 */
function startGameOverWatcher() {
    resetGameOverState();
    /**
     * Executes the loop routine.
     * The logic is centralized here for maintainability.
     */
    let loop = function() {
        let status = getGameOverStatus();
        handleGameOverStatus(status);
        if (!endOverlayShown) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

/**
 * Resets game over state.
 * The operation is isolated here to keep behavior predictable.
 */
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

/**
 * Returns the game over status.
 * This helper centralizes read access for callers.
 * @returns {string} Returns the resulting string value.
 */
function getGameOverStatus() {
    if (world?.character?.isDead?.()) return 'dead';
    let boss = getBoss();
    if (isBossDefeatedCheck(boss)) return 'bossDefeated';
    return null;
}

/**
 * Returns the boss.
 * This helper centralizes read access for callers.
 * @returns {unknown} Returns the value produced by this routine.
 */
function getBoss() {
    return world?.level?.enemies?.find(function(e) { return e instanceof Endboss; });
}

/**
 * Evaluates the boss defeated check condition.
 * Returns whether the current runtime state satisfies that condition.
 * @param {object} boss - Object argument used by this routine.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function isBossDefeatedCheck(boss) {
    return boss && (boss.isDeadState || boss.energy <= 0);
}

/**
 * Handles game over status.
 * It applies side effects required by this branch.
 * @param {string} status - String value used by this routine.
 */
function handleGameOverStatus(status) {
    if (status === 'dead') { handlePlayerDead(); return; }
    if (status === 'bossDefeated') handleBossDefeated();
}

/**
 * Handles player dead.
 * It applies side effects required by this branch.
 */
function handlePlayerDead() {
    if (endOverlayShown) return;
    triggerGameOverOverlay();
    controlsLocked = true;
}

/**
 * Handles boss defeated.
 * It applies side effects required by this branch.
 */
function handleBossDefeated() {
    if (endOverlayShown) return;
    showEndOverlay(getBossDefeatedOverlayConfig());
    controlsLocked = true;
    endOverlayShown = true;
}

/**
 * Returns the boss defeated overlay config.
 * This helper centralizes read access for callers.
 * @returns {object} Returns an object containing computed state values.
 */
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

/**
 * Executes the trigger game over overlay routine.
 * The logic is centralized here for maintainability.
 */
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

/**
 * Shows end overlay.
 * The operation is isolated here to keep behavior predictable.
 * @param {object} config - Configuration object that defines thresholds and behavior.
 */
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

/**
 * Resets keyboard.
 * The operation is isolated here to keep behavior predictable.
 */
function resetKeyboard() {
    if (controllers.keyboard) controllers.keyboard.reset();
}

window.showGameOverOverlay = triggerGameOverOverlay;

/**
 * Evaluates the ignore input condition.
 * Returns whether the current runtime state satisfies that condition.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function shouldIgnoreInput() {
    return isBossDefeated() || controlsLocked;
}

/**
 * Evaluates the boss defeated condition.
 * Returns whether the current runtime state satisfies that condition.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function isBossDefeated() {
    return world?.isBossDefeated?.();
}

/**
 * Executes the navigate to menu routine.
 * The logic is centralized here for maintainability.
 */
function navigateToMenu() {
    window.location.href = 'menu.html';
}

/**
 * Updates layout.
 * This synchronizes runtime state with current inputs.
 * @param {unknown} forcedMode - Input value used by this routine.
 */
function updateLayout(forcedMode) {
    if (controllers.orientation) controllers.orientation.applyLayout(forcedMode);
}

/**
 * Initializes touch controls.
 * It is part of the module startup flow.
 */
function setupTouchControls() {
    if (controllers.touch) controllers.touch.initOnce();
}

/**
 * Initializes mobile controls toggle.
 * It is part of the module startup flow.
 */
function setupMobileControlsToggle() {
    if (controllers.touch) controllers.touch.setupMobileToggle();
}

/**
 * Initializes touch controls media query.
 * It is part of the module startup flow.
 */
function setupTouchControlsMediaQuery() {
    if (controllers.touch) controllers.touch.setupMediaQuery();
}

/**
 * Updates touch controls visibility.
 * This synchronizes runtime state with current inputs.
 */
function updateTouchControlsVisibility() {
    if (controllers.touch) controllers.touch.updateVisibility();
}

/**
 * Updates touch controls UI.
 * This synchronizes runtime state with current inputs.
 */
function updateTouchControlsUI() {
    if (controllers.touch) controllers.touch.updateUI();
}

/**
 * Initializes mobile tablet detection.
 * It is part of the module startup flow.
 */
function setupMobileTabletDetection() {
    if (controllers.touch) controllers.touch.updateMobileTabletState();
}

/**
 * Updates mobile tablet state.
 * This synchronizes runtime state with current inputs.
 * @returns {boolean} Returns `true` when the condition is satisfied; otherwise `false`.
 */
function updateMobileTabletState() {
    if (controllers.touch) return controllers.touch.updateMobileTabletState();
    return false;
}

/**
 * Initializes sound toggle game.
 * It is part of the module startup flow.
 */
function setupSoundToggleGame() {
    if (controllers.soundToggle) controllers.soundToggle.init();
}

/**
 * Initializes orientation toggle.
 * It is part of the module startup flow.
 */
function setupOrientationToggle() {
    if (controllers.orientation) controllers.orientation.initToggle();
}

/**
 * Applies stored orientation.
 * The operation is isolated here to keep behavior predictable.
 */
function applyStoredOrientation() {
    if (controllers.orientation) controllers.orientation.applyStored();
}

/**
 * Ensures fullscreen target is available before continuing.
 * The operation is isolated here to keep behavior predictable.
 * @param {HTMLCanvasElement} canvasEl - Canvas element used for rendering or layout operations.
 * @returns {unknown|null} Returns the value computed for the active runtime branch.
 */
function ensureFullscreenTarget(canvasEl) {
    if (controllers.fullscreen) return controllers.fullscreen.ensureTarget(canvasEl);
    return null;
}

/**
 * Applies fullscreen contain scale.
 * The operation is isolated here to keep behavior predictable.
 */
function applyFullscreenContainScale() {
    if (controllers.fullscreen) controllers.fullscreen.applyContainBaseStyles();
}
