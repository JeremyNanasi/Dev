let canvas;
let world;
let keyboard = new Keyboard();
let fullscreenTarget;
let gameStarted = false;
let gameOverShown = false;
let gameOverOverlay;
let controlsLocked = false;
const GAME_OVER_STYLE_ID = 'game-over-animations';
let endOverlayShown = false;
let endOverlayElement;
const DEFAULT_CANVAS_WIDTH = 720;
const DEFAULT_CANVAS_HEIGHT = 480;
const KEYBOARD_CODE_MAP = {
    39: 'RIGHT',
    37: 'LEFT',
    38: 'UP',
    40: 'DOWN',
    32: 'SPACE',
    68: 'D'
};

let fsHintEl = null;
let inlineHintEl = null;
let lastHintText = null;
let endOverlayActive = false;
let touchControlsInitialized = false;
let touchControlsVisible = false;
let bgCanvas;
let bgContext;
let bgCaptureInterval;
let touchUiMql;
const TOUCH_CONTROLS_STORAGE_KEY = 'touch-controls-preference';
const SOUND_ENABLED_KEY = 'sound-enabled';
const ORIENTATION_MODE_KEY = 'orientation-mode';
const ORIENTATION_MODES = ['auto', 'portrait', 'landscape'];

function init() {
    canvas = document.getElementById('canvas');
    fullscreenTarget = ensureFullscreenTarget(canvas);
    setupBackgroundLayer();
    setupMobileTabletDetection();
    setupTouchControlsMediaQuery();
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
    resizeCanvas();
    setupTouchControls();
    setupSoundToggle();
    setupMobileControlsToggle();
    setupOrientationToggle();
    applyStoredOrientation();
    updateTouchControlsVisibility();
    startBackgroundCapture();
}

window.showWinOverlay = function () {
    showEndOverlay({ hint: '⏎ Enter – zurück zum Menü' });
};

function startGame() {
    if (gameStarted) {
        return;
    }

    gameStarted = true;
    document.getElementById('game-container')?.classList.remove('hidden');
    init();
}

function shouldStartGame() {
    const params = new URLSearchParams(window.location.search);
    return params.get('start') === '1';
}

function redirectToMenu() {
    window.location.replace('menu.html');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!shouldStartGame()) {
        redirectToMenu();
        return;
    }

    setupFullscreenToggle();
    startGame();
});

function ensureFullscreenTarget(canvasEl) {
    const existing = document.getElementById('fullscreen-target');
    if (existing) {
        applyFullscreenTargetDefaults(existing);
        return existing;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'fullscreen-target';

    const parent = canvasEl.parentNode;
    parent.insertBefore(wrapper, canvasEl);
    wrapper.appendChild(canvasEl);

    wrapper.style.display = 'block';
    wrapper.style.position = 'absolute';

    return wrapper;
}

function applyFullscreenTargetDefaults(wrapper) {
    wrapper.style.display = 'block';
    wrapper.style.position = 'absolute';
}

function setupFullscreenToggle() {
    const toggleButton = getFullscreenToggleButton();
    if (!toggleButton) {
        return;
    }

    registerFullscreenListeners(toggleButton);
}

function getFullscreenToggleButton() {
    return document.getElementById('fullscreen-toggle');
}

function registerFullscreenListeners(toggleButton) {
    toggleButton.addEventListener('click', () => handleFullscreenToggleClick());
    document.addEventListener('fullscreenchange', () => handleFullscreenChange(toggleButton));
    updateFullscreenButtonState(toggleButton);
}

function handleFullscreenToggleClick() {
    if (document.fullscreenElement) {
        document.exitFullscreen?.();
        return;
    }

    (fullscreenTarget || canvas)?.requestFullscreen?.();
}

function handleFullscreenChange(toggleButton) {
    updateFullscreenButtonState(toggleButton);
    updateLayout();
    syncHints();
}

function updateFullscreenButtonState(toggleButton) {
    const isFullscreen = Boolean(document.fullscreenElement);
    toggleButton.textContent = isFullscreen ? 'Vollbild verlassen' : 'Vollbild';
    toggleButton.classList.toggle('is-active', isFullscreen);
}

function resizeCanvas() {
    if (!canvas) {
        return;
    }

    canvas.width = DEFAULT_CANVAS_WIDTH;
    canvas.height = DEFAULT_CANVAS_HEIGHT;
}

function applyFullscreenContainScale(isFullscreen = Boolean(document.fullscreenElement)) {
    if (!fullscreenTarget) return;

    fullscreenTarget.style.position = 'absolute';
    fullscreenTarget.style.left = '50%';
    fullscreenTarget.style.top = '50%';
    fullscreenTarget.style.width = `${DEFAULT_CANVAS_WIDTH}px`;
    fullscreenTarget.style.height = `${DEFAULT_CANVAS_HEIGHT}px`;
    fullscreenTarget.style.display = 'block';
    fullscreenTarget.style.alignItems = '';
    fullscreenTarget.style.justifyContent = '';
    fullscreenTarget.style.background = 'transparent';
}

function resetFullscreenStyles() {
    if (!fullscreenTarget) return;

    fullscreenTarget.style.position = '';
    fullscreenTarget.style.left = '';
    fullscreenTarget.style.top = '';
    fullscreenTarget.style.width = '';
    fullscreenTarget.style.height = '';
    fullscreenTarget.style.display = 'inline-block';
    fullscreenTarget.style.alignItems = '';
    fullscreenTarget.style.justifyContent = '';
    fullscreenTarget.style.background = '';
    fullscreenTarget.style.transform = '';

    canvas.style.display = '';
}

window.addEventListener('resize', updateLayout);
window.addEventListener('resize', updateTouchControlsVisibility);
window.addEventListener('orientationchange', updateLayout);
window.addEventListener('orientationchange', updateMobileTabletState);
window.addEventListener('resize', updateMobileTabletState);

function startGameOverWatcher() {
    resetGameOverState();

    const loop = () => {
        const status = getGameOverStatus();
        handleGameOverStatus(status);

        if (!endOverlayShown) {
            requestAnimationFrame(loop);
        }
    };

    requestAnimationFrame(loop);
}

function resetGameOverState() {
    if (endOverlayElement) {
        endOverlayElement.remove();
    }

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
    if (world?.character?.isDead?.()) {
        return 'dead';
    }

    const boss = getBoss();
    if (isBossDefeated(boss)) {
        return 'bossDefeated';
    }

    return null;
}

function getBoss() {
    return world?.level?.enemies?.find((enemy) => enemy instanceof Endboss);
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
    if (endOverlayShown) {
        return;
    }

    triggerGameOverOverlay();
    controlsLocked = true;
}

function handleBossDefeated() {
    if (endOverlayShown) {
        return;
    }

    showEndOverlay(getBossDefeatedOverlayConfig());
    controlsLocked = true;
    endOverlayShown = true;
}

function getBossDefeatedOverlayConfig() {
    return {
        imgSrc: './img/You won, you lost/You Win A.png',
        alt: 'You Won',
        hint: '⏎ Enter – zurück zum Menü',
        fit: 'contain',
        width: '85vw',
        height: '85vh',
        maxWidth: '900px',
        maxHeight: '600px'
    };
}

function triggerGameOverOverlay() {
    if (endOverlayShown || gameOverOverlay) {
        return;
    }

    showEndOverlay({
        imgSrc: './img/9_intro_outro_screens/game_over/game over.png',
        alt: 'Game Over',
        hint: '⏎ Enter – zurück zum Menü'
    });
    gameOverShown = true;
    endOverlayShown = true;
}

function showEndOverlay(config = {}) {
    lastHintText = config.hint || lastHintText;
    endOverlayActive = true;

    if (!endOverlayShown) {
        endOverlayShown = true;
        controlsLocked = true;
        resetKeyboard();
    }

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

    if (!document.fullscreenElement) return;
    if (!lastHintText) return;

    if (!fsHintEl) {
        fsHintEl = document.createElement('div');
        fsHintEl.id = 'fs-hint';
        Object.assign(fsHintEl.style, {
            position: 'fixed',
            left: '50%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            zIndex: '99999',
            pointerEvents: 'none'
        });
        buildHintBaseStyles(fsHintEl);
    }

    fsHintEl.textContent = lastHintText;

    const host = document.fullscreenElement === canvas ? fullscreenTarget : document.fullscreenElement;
    const target = host || document.body;

    if (fsHintEl.parentNode !== target) {
        fsHintEl.remove();
        target.appendChild(fsHintEl);
    }
}

function removeFullscreenHint() {
    if (fsHintEl && fsHintEl.parentNode) {
        fsHintEl.parentNode.removeChild(fsHintEl);
    }
}

function showInlineHint(text) {
    lastHintText = text || lastHintText;

    if (document.fullscreenElement) return;
    if (!lastHintText) return;

    if (!inlineHintEl) {
        inlineHintEl = document.createElement('div');
        inlineHintEl.id = 'inline-hint';
        Object.assign(inlineHintEl.style, {
            display: 'inline-block',
            marginTop: '14px',
            pointerEvents: 'none'
        });
        buildHintBaseStyles(inlineHintEl);
    }

    inlineHintEl.textContent = lastHintText;

    const host = fullscreenTarget || canvas?.parentNode;
    const parent = host?.parentNode || document.body;

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
    if (inlineHintEl && inlineHintEl.parentNode) {
        inlineHintEl.parentNode.removeChild(inlineHintEl);
    }
}

function syncHints() {
    if (!endOverlayActive) {
        removeFullscreenHint();
        removeInlineHint();
        return;
    }

    if (document.fullscreenElement) {
        removeInlineHint();
        showFullscreenHint(lastHintText);
    } else {
        removeFullscreenHint();
        showInlineHint(lastHintText);
    }
}

function resetKeyboard() {
    Object.keys(KEYBOARD_CODE_MAP).forEach(code => {
        const key = KEYBOARD_CODE_MAP[code];
        keyboard[key] = false;
    });
}

function ensureGameOverStyles() {
    if (document.getElementById(GAME_OVER_STYLE_ID)) {
        return;
    }

    const style = buildGameOverStyleElement();
    document.head.appendChild(style);
}

function buildGameOverStyleElement() {
    const style = document.createElement('style');
    style.id = GAME_OVER_STYLE_ID;
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

window.showGameOverOverlay = triggerGameOverOverlay;

window.addEventListener("keydown", (e) => {
    if (handleEnterMenuNavigation(e)) {
        return;
    }
    if (handleLockedEnter(e)) {
        return;
    }
    if (shouldIgnoreInput()) {
        return;
    }
    setKeyboardState(e.keyCode, true);
});

function handleEnterMenuNavigation(e) {
    if (isEnterKey(e) && (endOverlayShown || controlsLocked || isBossDefeated())) {
        e.preventDefault();
        navigateToMenu();
        return true;
    }
    return false;
}

function handleLockedEnter(e) {
    if ((controlsLocked || endOverlayShown) && isEnterKey(e)) {
        e.preventDefault();
        navigateToMenu();
        return true;
    }

    return false;
}

function shouldIgnoreInput() {
    return isBossDefeated() || controlsLocked;
}

function isEnterKey(e) {
    return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
}

function isBossDefeated() {
    return world?.isBossDefeated?.();
}

function navigateToMenu() {
    window.location.href = 'menu.html';
}

function setKeyboardState(keyCode, isPressed) {
    const key = KEYBOARD_CODE_MAP[keyCode];
    if (!key) {
        return;
    }

    keyboard[key] = isPressed;
}

window.addEventListener("keyup", (e) => {
    if (isBossDefeated()) {
        return;
    }

    if (controlsLocked) {
        return;
    }

    setKeyboardState(e.keyCode, false);
});

function setupTouchControls() {
    if (touchControlsInitialized) {
        return;
    }

    const buttons = Array.from(document.querySelectorAll('.touch-control-button'));
    if (!buttons.length) {
        return;
    }

    const keyToButton = new Map();
    const mousePressedKeys = new Set();

    const getKeysForButton = (key) => {
        if (key === 'SPACE' || key === 'UP') {
            return ['SPACE', 'UP'];
        }
        return [key];
    };

    buttons.forEach((button) => {
        const key = button.dataset.key;
        if (!key) {
            return;
        }
        keyToButton.set(key, button);

        const handlePressStart = (event, source) => {
            if (shouldIgnoreInput()) {
                return;
            }
            event.preventDefault();

            const keys = getKeysForButton(key);
            keys.forEach((k) => keyboard[k] = true);

            button.classList.add('is-pressed');
            if (source === 'mouse') {
                mousePressedKeys.add(key);
            }
        };

        const handlePressEnd = (event) => {
            event.preventDefault();

            const keys = getKeysForButton(key);
            const isJump = keys.includes('SPACE') || keys.includes('UP');

            if (isJump) {
                setTimeout(() => {
                    keys.forEach((k) => keyboard[k] = false);
                }, 120);
            } else {
                keys.forEach((k) => keyboard[k] = false);
            }

            button.classList.remove('is-pressed');
            mousePressedKeys.delete(key);
        };

        button.addEventListener('touchstart', (event) => handlePressStart(event, 'touch'), { passive: false });
        button.addEventListener('touchend', handlePressEnd, { passive: false });
        button.addEventListener('touchcancel', handlePressEnd, { passive: false });
        button.addEventListener('mousedown', (event) => handlePressStart(event, 'mouse'));
        button.addEventListener('mouseup', handlePressEnd);
        button.addEventListener('mouseleave', handlePressEnd);
    });

    window.addEventListener('mouseup', (event) => {
        if (!mousePressedKeys.size) {
            return;
        }
        event.preventDefault();
        mousePressedKeys.forEach((key) => {
            const keys = (key === 'SPACE' || key === 'UP') ? ['SPACE', 'UP'] : [key];
            keys.forEach((k) => keyboard[k] = false);
            keyToButton.get(key)?.classList.remove('is-pressed');
        });
        mousePressedKeys.clear();
    });

    touchControlsInitialized = true;
}

function setupMobileControlsToggle() {
    const toggle = document.getElementById('mobile-controls-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        touchControlsVisible = !touchControlsVisible;
        localStorage.setItem(TOUCH_CONTROLS_STORAGE_KEY, touchControlsVisible ? 'on' : 'off');
        updateTouchControlsUI();
    });
}

function setupTouchControlsMediaQuery() {
    if (!window.matchMedia) {
        return;
    }
    touchUiMql = window.matchMedia('(max-width: 900px)');
    touchUiMql.addEventListener('change', updateTouchControlsVisibility);
}

function detectMobileTablet() {
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    const noHover = window.matchMedia?.('(hover: none)')?.matches;
    return hasTouchPoints || (coarsePointer && noHover);
}

function updateMobileTabletState() {
    const detected = detectMobileTablet();
    document.body.classList.toggle('is-mobile-tablet', detected);
    return detected;
}

function setupMobileTabletDetection() {
    updateMobileTabletState();
}

function updateTouchControlsVisibility() {
    const stored = localStorage.getItem(TOUCH_CONTROLS_STORAGE_KEY);
    const isMobileTablet = document.body.classList.contains('is-mobile-tablet');
    const isWithinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= 900;
    if (stored === 'on') {
        touchControlsVisible = true;
    } else if (stored === 'off') {
        touchControlsVisible = false;
    } else {
        touchControlsVisible = isMobileTablet && isWithinBreakpoint;
    }

    if (!isMobileTablet || !isWithinBreakpoint) {
        touchControlsVisible = false;
    }

    updateTouchControlsUI();
}

function updateTouchControlsUI() {
    const controls = document.getElementById('touch-controls');
    const toggle = document.getElementById('mobile-controls-toggle');
    const shouldShow = Boolean(touchControlsVisible);

    controls?.classList.toggle('is-visible', shouldShow);
    document.body.classList.toggle('touch-controls-visible', shouldShow);
    document.body.classList.toggle('touch-controls-hidden', !shouldShow);

    if (toggle) {
        toggle.textContent = shouldShow ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }

    const orientationToggle = document.getElementById('orientation-toggle');
    if (orientationToggle) {
        const withinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= 900;
        orientationToggle.style.display = shouldShow || withinBreakpoint ? 'inline-flex' : 'none';
    }
}

function setupSoundToggle() {
    const button = document.getElementById('mute-toggle');
    const icon = document.getElementById('mute-icon');
    if (!button || !icon) return;

    button.addEventListener('click', () => {
        const isEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
        setSoundEnabled(!isEnabled);
    });

    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    const initialEnabled = stored !== 'false';
    setSoundEnabled(initialEnabled);
}

function setSoundEnabled(enabled) {
    const icon = document.getElementById('mute-icon');
    const button = document.getElementById('mute-toggle');
    const audios = document.querySelectorAll('audio');

    audios.forEach((audio) => {
        audio.muted = !enabled;
    });

    if (icon) {
        icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
        icon.alt = enabled ? 'Sound an' : 'Sound aus';
    }

    if (button) {
        button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    }

    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

function setupOrientationToggle() {
    const button = document.getElementById('orientation-toggle');
    if (!button) return;

    button.addEventListener('click', () => {
        const current = localStorage.getItem(ORIENTATION_MODE_KEY) || 'auto';
        const nextMode = getNextOrientationMode(current);
        localStorage.setItem(ORIENTATION_MODE_KEY, nextMode);
        updateLayout();
    });
}

function getNextOrientationMode(current) {
    const index = ORIENTATION_MODES.indexOf(current);
    if (index === -1) {
        return ORIENTATION_MODES[0];
    }
    return ORIENTATION_MODES[(index + 1) % ORIENTATION_MODES.length];
}

function applyStoredOrientation() {
    const stored = localStorage.getItem(ORIENTATION_MODE_KEY) || 'auto';
    updateLayout(stored);
}

function applyOrientationMode(mode) {
    const button = document.getElementById('orientation-toggle');
    const normalized = ORIENTATION_MODES.includes(mode) ? mode : 'auto';

    document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
    document.body.classList.add(`orientation-${normalized}`);

    if (button) {
        const label = normalized === 'auto' ? 'Auto' : normalized === 'portrait' ? 'Hochformat' : 'Querformat';
        button.textContent = `Ausrichtung: ${label}`;
    }
}

async function syncOrientationLock(targetOrientation, mode) {
    if (!document.fullscreenElement) {
        return false;
    }

    const resolvedMode = ORIENTATION_MODES.includes(mode) ? mode : 'auto';
    const orientation = screen.orientation;

    if (!orientation || typeof orientation.lock !== 'function') {
        return false;
    }

    if (resolvedMode === 'auto') {
        orientation.unlock?.();
        return true;
    }

    const lockMode = targetOrientation === 'portrait' ? 'portrait' : 'landscape';
    try {
        await orientation.lock(lockMode);
        return true;
    } catch {
        return false;
    }
}

function updateLayout(forcedMode) {
    if (!canvas || !fullscreenTarget) {
        return;
    }

    const storedMode = forcedMode || localStorage.getItem(ORIENTATION_MODE_KEY) || 'auto';
    const mode = ORIENTATION_MODES.includes(storedMode) ? storedMode : 'auto';
    const viewportOrientation = getViewportOrientation();
    const targetOrientation = mode === 'auto' ? viewportOrientation : mode;
    const isFullscreen = Boolean(document.fullscreenElement);

    applyOrientationMode(mode);
    resizeCanvas();
    applyFullscreenContainScale(isFullscreen);
    document.body.classList.toggle('is-fullscreen', isFullscreen);
    updateBackgroundCanvasSize();

    const applyLayout = (useFallback) => {
        const rotation = useFallback ? getFallbackRotation(targetOrientation, viewportOrientation) : 0;
        const scale = computeContainScale(window.innerWidth, window.innerHeight, rotation);
        fullscreenTarget.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
    };

    if (!isFullscreen) {
        applyLayout(true);
        return;
    }

    syncOrientationLock(targetOrientation, mode).then((locked) => {
        applyLayout(!locked);
    });
}

function getViewportOrientation() {
    if (window.matchMedia) {
        return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }
    return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
}

function getFallbackRotation(targetOrientation, viewportOrientation) {
    if (targetOrientation !== viewportOrientation) {
        return targetOrientation === 'landscape' ? 90 : 270;
    }

    const orientationType = screen.orientation?.type || '';
    if (orientationType.includes('secondary')) {
        return 180;
    }

    return 0;
}

function computeContainScale(viewportWidth, viewportHeight, rotation) {
    const normalized = ((rotation % 360) + 360) % 360;
    const rotated = normalized === 90 || normalized === 270;
    const baseWidth = rotated ? DEFAULT_CANVAS_HEIGHT : DEFAULT_CANVAS_WIDTH;
    const baseHeight = rotated ? DEFAULT_CANVAS_WIDTH : DEFAULT_CANVAS_HEIGHT;
    return Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
}

function setupBackgroundLayer() {
    bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) {
        return;
    }
    bgContext = bgCanvas.getContext('2d');
    updateBackgroundCanvasSize();
}

function updateBackgroundCanvasSize() {
    if (!bgCanvas) {
        return;
    }
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (bgCanvas.width !== width || bgCanvas.height !== height) {
        bgCanvas.width = width;
        bgCanvas.height = height;
    }
}

function startBackgroundCapture() {
    if (bgCaptureInterval) {
        return;
    }
    bgCaptureInterval = window.setInterval(() => {
        captureBackgroundFrame();
    }, 250);
}

function captureBackgroundFrame() {
    if (!bgCanvas || !bgContext || !canvas) {
        return;
    }
    if (!canvas.width || !canvas.height) {
        return;
    }

    const targetWidth = bgCanvas.width;
    const targetHeight = bgCanvas.height;
    if (!targetWidth || !targetHeight) {
        return;
    }

    const srcWidth = canvas.width;
    const srcHeight = canvas.height;
    if (!srcWidth || !srcHeight) {
        return;
    }

    const scale = Math.max(targetWidth / srcWidth, targetHeight / srcHeight);
    const drawWidth = srcWidth * scale;
    const drawHeight = srcHeight * scale;
    const dx = (targetWidth - drawWidth) / 2;
    const dy = (targetHeight - drawHeight) / 2;

    bgContext.clearRect(0, 0, targetWidth, targetHeight);
    bgContext.drawImage(canvas, dx, dy, drawWidth, drawHeight);
}
