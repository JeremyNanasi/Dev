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

function init() {
    canvas = document.getElementById('canvas');
    fullscreenTarget = ensureFullscreenTarget(canvas);
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
    resizeCanvas();
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
        return existing;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'fullscreen-target';

    const parent = canvasEl.parentNode;
    parent.insertBefore(wrapper, canvasEl);
    wrapper.appendChild(canvasEl);

    wrapper.style.display = 'inline-block';
    wrapper.style.position = 'relative';

    return wrapper;
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
    resizeCanvas();
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

    if (document.fullscreenElement) {
        applyFullscreenContainScale();
    } else {
        resetFullscreenStyles();
    }
}

function applyFullscreenContainScale() {
    if (!fullscreenTarget) return;

    fullscreenTarget.style.position = 'fixed';
    fullscreenTarget.style.inset = '0';
    fullscreenTarget.style.width = '100vw';
    fullscreenTarget.style.height = '100vh';
    fullscreenTarget.style.display = 'flex';
    fullscreenTarget.style.alignItems = 'center';
    fullscreenTarget.style.justifyContent = 'center';
    fullscreenTarget.style.background = '#000';

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const scale = Math.min(vw / DEFAULT_CANVAS_WIDTH, vh / DEFAULT_CANVAS_HEIGHT);
    const scaledW = Math.floor(DEFAULT_CANVAS_WIDTH * scale);
    const scaledH = Math.floor(DEFAULT_CANVAS_HEIGHT * scale);

    canvas.style.width = scaledW + 'px';
    canvas.style.height = scaledH + 'px';
    canvas.style.display = 'block';
}

function resetFullscreenStyles() {
    if (!fullscreenTarget) return;

    fullscreenTarget.style.position = '';
    fullscreenTarget.style.inset = '';
    fullscreenTarget.style.width = '';
    fullscreenTarget.style.height = '';
    fullscreenTarget.style.display = 'inline-block';
    fullscreenTarget.style.alignItems = '';
    fullscreenTarget.style.justifyContent = '';
    fullscreenTarget.style.background = '';

    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.display = '';
}

window.addEventListener('resize', resizeCanvas);

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
