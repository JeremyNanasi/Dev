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


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
    resizeCanvas();
}

function startGame() {
    if (gameStarted) {
        return;
    }

    gameStarted = true;
    document.getElementById('game-container')?.classList.remove('hidden');
    init();
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const shouldStart = params.get('start') === '1';

    if (!shouldStart) {
        window.location.replace('menu.html');
        return;
    }

    setupFullscreenToggle();
    startGame();
});

function setupFullscreenToggle() {
    const toggleButton = document.getElementById('fullscreen-toggle');
    if (!toggleButton) {
        return;
    }

    const updateButtonState = () => {
        const isFullscreen = Boolean(document.fullscreenElement);
        toggleButton.textContent = isFullscreen ? 'Vollbild verlassen' : 'Vollbild';
        toggleButton.classList.toggle('is-active', isFullscreen);
    };

    toggleButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            canvas?.requestFullscreen?.();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        updateButtonState();
        resizeCanvas();
    });
    updateButtonState();
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
    if (endOverlayElement) {
        endOverlayElement.remove();
    }
    gameOverOverlay = null;
    endOverlayElement = null;
    gameOverShown = false;
    endOverlayShown = false;
    controlsLocked = false;
    resetKeyboard();

    const loop = () => {
        const isDead = world?.character?.isDead?.();
        const boss = world?.level?.enemies?.find((enemy) => enemy instanceof Endboss);
        const bossDefeated = boss && (boss.isDeadState || boss.energy <= 0);

        if (isDead && !endOverlayShown) {
            triggerGameOverOverlay();
            controlsLocked = true;
        } else if (bossDefeated && !endOverlayShown) {
            showEndOverlay({
                imgSrc: './img/You won, you lost/You Win A.png',
                alt: 'You Won',
                hint: '⏎ Enter – zurück zum Menü',
                fit: 'contain',
                width: '85vw',
                height: '85vh',
                maxWidth: '900px',
                maxHeight: '600px'
            });
            controlsLocked = true;
            endOverlayShown = true;
        }

        if (!endOverlayShown) {
            requestAnimationFrame(loop);
        }
    };

    requestAnimationFrame(loop);
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

function showEndOverlay({ imgSrc, alt, hint }) {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'transparent';
    overlay.style.zIndex = '9999';
    overlay.style.flexDirection = 'column';
    if (gameOverOverlay) {
        return;
    }

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = alt;
    img.style.width = '600px';
    img.style.maxWidth = '90vw';
    img.style.height = 'auto';
    img.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))';
    img.style.animation = 'gameOverPop 0.5s ease-out forwards, gameOverPulse 1.2s ease-in-out 0.5s infinite alternate';

    const hintEl = document.createElement('div');
    hintEl.textContent = hint;
    hintEl.style.marginTop = '20px';
    hintEl.style.padding = '10px 14px';
    hintEl.style.borderRadius = '10px';
    hintEl.style.background = 'rgba(0,0,0,0.55)';
    hintEl.style.color = '#fff';
    hintEl.style.fontFamily = 'Inter, Arial, sans-serif';
    hintEl.style.fontWeight = '700';
    hintEl.style.letterSpacing = '0.6px';
    hintEl.style.boxShadow = '0 10px 20px rgba(0,0,0,0.35)';

    overlay.appendChild(img);
    overlay.appendChild(hintEl);
    const fullscreenRoot = document.fullscreenElement;
    const overlayRoot = fullscreenRoot && fullscreenRoot !== canvas ? fullscreenRoot : document.body;
    overlayRoot.appendChild(overlay);
    document.body.appendChild(overlay);
    gameOverOverlay = overlay;
    endOverlayElement = overlay;
    controlsLocked = true;
    resetKeyboard();
}

function ensureGameOverStyles() {
    if (document.getElementById(GAME_OVER_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = GAME_OVER_STYLE_ID;
    style.textContent = `
        @keyframes gameOverPop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gameOverPulse {
            0% { transform: scale(1); }
            100% { transform: scale(0.9); }
        }
    `;
    document.head.appendChild(style);
}

window.showGameOverOverlay = triggerGameOverOverlay;

window.addEventListener("keydown", (e) => {
    const isEnter = e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    if ((controlsLocked || endOverlayShown) && isEnter) {
        e.preventDefault();
        window.location.href = 'menu.html';
        return;
    }

    if (controlsLocked) {
        return;
    }

    if(e.keyCode == 39) {
        keyboard.RIGHT = true;
    }

    if(e.keyCode == 37) {
        keyboard.LEFT = true;
    }

    if(e.keyCode == 38) {
        keyboard.UP = true;
    }

    if(e.keyCode == 40) {
        keyboard.DOWN = true;
    }

    if(e.keyCode == 32) {
        keyboard.SPACE = true;
    }

    if(e.keyCode == 68) {
        keyboard.D = true;
    }
});

window.addEventListener("keyup", (e) => {
        if (controlsLocked) {
        return;
    }

    if(e.keyCode == 39) {
        keyboard.RIGHT = false;
    }

    if(e.keyCode == 37) {
        keyboard.LEFT = false;
    }

    if(e.keyCode == 38) {
        keyboard.UP = false;
    }

    if(e.keyCode == 40) {
        keyboard.DOWN = false;
    }

    if(e.keyCode == 32) {
        keyboard.SPACE = false;
    }

    if(e.keyCode == 68) {
        keyboard.D = false;
    }
});
