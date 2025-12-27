let canvas;
let world;
let keyboard = new Keyboard();
let gameStarted = false;
let gameOverShown = false;
let gameOverOverlay;
let controlsLocked = false;
const GAME_OVER_STYLE_ID = 'game-over-animations';


function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
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

    startGame();
});

function startGameOverWatcher() {
    if (gameOverOverlay) {
        gameOverOverlay.remove();
    }
    gameOverOverlay = null;
    gameOverShown = false;
    controlsLocked = false;

    const loop = () => {
        const isDead = world?.character?.isDead?.();
        if (isDead && !gameOverShown) {
            showGameOverOverlay();
            gameOverShown = true;
        }

        if (!gameOverShown) {
            requestAnimationFrame(loop);
        }
    };

    requestAnimationFrame(loop);
}

function showGameOverOverlay() {
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

    const img = document.createElement('img');
    img.src = './img/9_intro_outro_screens/game_over/game over.png';
    img.alt = 'Game Over';
    img.style.width = '600px';
    img.style.maxWidth = '90vw';
    img.style.height = 'auto';
    img.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))';
    img.style.animation = 'gameOverPop 0.5s ease-out forwards, gameOverPulse 1.2s ease-in-out 0.5s infinite alternate';

    overlay.appendChild(img);
    document.body.appendChild(overlay);
    gameOverOverlay = overlay;
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

window.addEventListener("keydown", (e) => {
        if (controlsLocked && e.keyCode === 13) {
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
