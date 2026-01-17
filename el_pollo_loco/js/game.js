let canvas;
let world;
let keyboard = new Keyboard();
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

function init() {
    canvas = document.getElementById('canvas');
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

    canvas?.requestFullscreen?.();
}

function handleFullscreenChange(toggleButton) {
    updateFullscreenButtonState(toggleButton);
    resizeCanvas();
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

    if (document.fullscreenElement && fullscreenTarget && document.fullscreenElement === fullscreenTarget) {
        const size = Math.min(window.innerWidth, window.innerHeight);
        canvas.width = Math.max(1, Math.floor(size));
        canvas.height = Math.max(1, Math.floor(size));
    } else {
        canvas.width = DEFAULT_CANVAS_WIDTH;
        canvas.height = DEFAULT_CANVAS_HEIGHT;
    }
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

function showEndOverlay({ hint }) {
    if (endOverlayElement) {
        return;
    }

    const overlay = createEndOverlay();
    const hintEl = createEndOverlayHint(hint);

    appendEndOverlay(overlay, hintEl);
    setEndOverlayState(overlay);
}

function createEndOverlay() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: '28px',
        zIndex: '9999',
        pointerEvents: 'none'
    });
    return overlay;
}

function createEndOverlayImage(imgSrc, alt) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = alt;
    Object.assign(img.style, {
        maxWidth: '80vw',
        maxHeight: '70vh',
        objectFit: 'contain'
    });
    return img;
}

function createEndOverlayHint(hint) {
    const hintEl = document.createElement('div');
    hintEl.textContent = hint;
    applyHintStyles(hintEl);
    return hintEl;
}

function applyHintStyles(hintEl) {
    Object.assign(hintEl.style, {
        marginTop: '20px',
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

function appendEndOverlay(overlay, hintEl) {
    overlay.appendChild(hintEl);

    const fullscreenRoot = document.fullscreenElement;
    const overlayRoot = fullscreenRoot && fullscreenRoot !== canvas ? fullscreenRoot : document.body;
    overlayRoot.appendChild(overlay);
}

function setEndOverlayState(overlay) {
    endOverlayElement = overlay;
    endOverlayShown = true;
    controlsLocked = true;
    resetKeyboard();
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