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
let touchControlsInitialized = false;
let touchControlsVisible = false;
let touchUiMql;

let GAME_OVER_STYLE_ID = 'game-over-animations';
let KEYBOARD_CODE_MAP = {
    39: 'RIGHT',
    37: 'LEFT',
    38: 'UP',
    40: 'DOWN',
    32: 'SPACE',
    68: 'D'
};

function init() {
    canvas = document.getElementById('canvas');
    fullscreenTarget = ensureFullscreenTarget(canvas);
    setupMobileTabletDetection();
    setupTouchControlsMediaQuery();
    world = new World(canvas, keyboard);
    ensureGameOverStyles();
    startGameOverWatcher();
    resizeCanvas();
    setupTouchControls();
    setupSoundToggleGame();
    setupMobileControlsToggle();
    setupOrientationToggle();
    applyStoredOrientation();
    updateTouchControlsVisibility();
    initSoundOnGesture();
}

function initSoundOnGesture() {
    let handler = function() {
        if (window.EPL && window.EPL.Sound) {
            window.EPL.Sound.tryPlayOnGesture();
        }
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
    if (window.EPL && window.EPL.Sound) {
        window.EPL.Sound.init();
    }
    if (!shouldStartGame()) {
        redirectToMenu();
        return;
    }
    setupFullscreenToggle();
    startGame();
});

function ensureFullscreenTarget(canvasEl) {
    let existing = document.getElementById('fullscreen-target');
    if (existing) {
        applyFullscreenTargetDefaults(existing);
        return existing;
    }
    let wrapper = document.createElement('div');
    wrapper.id = 'fullscreen-target';
    let parent = canvasEl.parentNode;
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
    let toggleButton = getFullscreenToggleButton();
    if (!toggleButton) return;
    registerFullscreenListeners(toggleButton);
}

function getFullscreenToggleButton() {
    return document.getElementById('fullscreen-toggle');
}

function registerFullscreenListeners(toggleButton) {
    toggleButton.addEventListener('click', function() { handleFullscreenToggleClick(); });
    document.addEventListener('fullscreenchange', function() { handleFullscreenChange(toggleButton); });
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
    let isFullscreen = Boolean(document.fullscreenElement);
    toggleButton.textContent = isFullscreen ? 'Vollbild verlassen' : 'Vollbild';
    toggleButton.classList.toggle('is-active', isFullscreen);
}

function resizeCanvas() {
    if (!canvas) return;
    let w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    let h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
    canvas.width = w;
    canvas.height = h;
}

function applyFullscreenContainScale() {
    if (!fullscreenTarget) return;
    let w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    let h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
    fullscreenTarget.style.position = 'absolute';
    fullscreenTarget.style.left = '50%';
    fullscreenTarget.style.top = '50%';
    fullscreenTarget.style.width = w + 'px';
    fullscreenTarget.style.height = h + 'px';
    fullscreenTarget.style.display = 'block';
    fullscreenTarget.style.alignItems = '';
    fullscreenTarget.style.justifyContent = '';
    fullscreenTarget.style.background = 'transparent';
}

window.addEventListener('resize', updateLayout);
window.addEventListener('resize', updateTouchControlsVisibility);
window.addEventListener('orientationchange', updateLayout);
window.addEventListener('orientationchange', updateMobileTabletState);
window.addEventListener('resize', updateMobileTabletState);

function startGameOverWatcher() {
    resetGameOverState();
    let loop = function() {
        let status = getGameOverStatus();
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
    if (world?.character?.isDead?.()) return 'dead';
    let boss = getBoss();
    if (isBossDefeatedCheck(boss)) return 'bossDefeated';
    return null;
}

function getBoss() {
    return world?.level?.enemies?.find(function(enemy) { return enemy instanceof Endboss; });
}

function isBossDefeatedCheck(boss) {
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
    let host = document.fullscreenElement === canvas ? fullscreenTarget : document.fullscreenElement;
    let target = host || document.body;
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
    Object.keys(KEYBOARD_CODE_MAP).forEach(function(code) {
        let key = KEYBOARD_CODE_MAP[code];
        keyboard[key] = false;
    });
}

function ensureGameOverStyles() {
    if (document.getElementById(GAME_OVER_STYLE_ID)) return;
    let style = buildGameOverStyleElement();
    document.head.appendChild(style);
}

function buildGameOverStyleElement() {
    let style = document.createElement('style');
    style.id = GAME_OVER_STYLE_ID;
    style.textContent = getGameOverStyleText();
    return style;
}

function getGameOverStyleText() {
    return '@keyframes gameOverPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } } @keyframes gameOverPulse { 0% { transform: scale(1); } 100% { transform: scale(0.9); } }';
}

window.showGameOverOverlay = triggerGameOverOverlay;

window.addEventListener('keydown', function(e) {
    if (handleEnterMenuNavigation(e)) return;
    if (handleLockedEnter(e)) return;
    if (shouldIgnoreInput()) return;
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
    let key = KEYBOARD_CODE_MAP[keyCode];
    if (!key) return;
    keyboard[key] = isPressed;
}

window.addEventListener('keyup', function(e) {
    if (isBossDefeated()) return;
    if (controlsLocked) return;
    setKeyboardState(e.keyCode, false);
});

function setupTouchControls() {
    if (touchControlsInitialized) return;
    let buttons = Array.from(document.querySelectorAll('.touch-control-button'));
    if (!buttons.length) return;
    let keyToButton = new Map();
    let mousePressedKeys = new Set();
    let getKeysForButton = function(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    };
    buttons.forEach(function(button) {
        let key = button.dataset.key;
        if (!key) return;
        keyToButton.set(key, button);
        let handlePressStart = function(event, source) {
            if (shouldIgnoreInput()) return;
            event.preventDefault();
            let keys = getKeysForButton(key);
            keys.forEach(function(k) { keyboard[k] = true; });
            button.classList.add('is-pressed');
            if (source === 'mouse') mousePressedKeys.add(key);
        };
        let handlePressEnd = function(event) {
            event.preventDefault();
            let keys = getKeysForButton(key);
            let isJump = keys.includes('SPACE') || keys.includes('UP');
            if (isJump) {
                setTimeout(function() { keys.forEach(function(k) { keyboard[k] = false; }); }, 120);
            } else {
                keys.forEach(function(k) { keyboard[k] = false; });
            }
            button.classList.remove('is-pressed');
            mousePressedKeys.delete(key);
        };
        button.addEventListener('touchstart', function(e) { handlePressStart(e, 'touch'); }, { passive: false });
        button.addEventListener('touchend', handlePressEnd, { passive: false });
        button.addEventListener('touchcancel', handlePressEnd, { passive: false });
        button.addEventListener('mousedown', function(e) { handlePressStart(e, 'mouse'); });
        button.addEventListener('mouseup', handlePressEnd);
        button.addEventListener('mouseleave', handlePressEnd);
    });
    window.addEventListener('mouseup', function(event) {
        if (!mousePressedKeys.size) return;
        event.preventDefault();
        mousePressedKeys.forEach(function(key) {
            let keys = (key === 'SPACE' || key === 'UP') ? ['SPACE', 'UP'] : [key];
            keys.forEach(function(k) { keyboard[k] = false; });
            let btn = keyToButton.get(key);
            if (btn) btn.classList.remove('is-pressed');
        });
        mousePressedKeys.clear();
    });
    touchControlsInitialized = true;
}

function setupMobileControlsToggle() {
    let toggle = document.getElementById('mobile-controls-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function() {
        touchControlsVisible = !touchControlsVisible;
        let key = window.EPL ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
        localStorage.setItem(key, touchControlsVisible ? 'on' : 'off');
        updateTouchControlsUI();
    });
}

function setupTouchControlsMediaQuery() {
    if (!window.matchMedia) return;
    let bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    touchUiMql = window.matchMedia('(max-width: ' + bp + 'px)');
    touchUiMql.addEventListener('change', updateTouchControlsVisibility);
}

function detectMobileTablet() {
    let hasTouchPoints = navigator.maxTouchPoints > 0;
    let coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    let noHover = window.matchMedia?.('(hover: none)')?.matches;
    return hasTouchPoints || (coarsePointer && noHover);
}

function updateMobileTabletState() {
    let detected = detectMobileTablet();
    document.body.classList.toggle('is-mobile-tablet', detected);
    return detected;
}

function setupMobileTabletDetection() {
    updateMobileTabletState();
}

function updateTouchControlsVisibility() {
    let key = window.EPL ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
    let stored = localStorage.getItem(key);
    let isMobileTablet = document.body.classList.contains('is-mobile-tablet');
    let bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    let isWithinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= bp;
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
    let controls = document.getElementById('touch-controls');
    let toggle = document.getElementById('mobile-controls-toggle');
    let shouldShow = Boolean(touchControlsVisible);
    if (controls) controls.classList.toggle('is-visible', shouldShow);
    document.body.classList.toggle('touch-controls-visible', shouldShow);
    document.body.classList.toggle('touch-controls-hidden', !shouldShow);
    if (toggle) {
        toggle.textContent = shouldShow ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }
    let orientationToggle = document.getElementById('orientation-toggle');
    if (orientationToggle) {
        let bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
        let withinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= bp;
        orientationToggle.style.display = shouldShow || withinBreakpoint ? 'inline-flex' : 'none';
    }
}

function setupSoundToggleGame() {
    let button = document.getElementById('mute-toggle');
    let icon = document.getElementById('mute-icon');
    if (!button || !icon) return;
    button.addEventListener('click', function() {
        if (window.EPL && window.EPL.Sound) {
            let next = window.EPL.Sound.toggle();
            updateSoundIcon(next);
        }
    });
    let enabled = window.EPL && window.EPL.Sound ? window.EPL.Sound.isEnabled() : true;
    updateSoundIcon(enabled);
}

function updateSoundIcon(enabled) {
    let icon = document.getElementById('mute-icon');
    let button = document.getElementById('mute-toggle');
    if (icon) {
        icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
        icon.alt = enabled ? 'Sound an' : 'Sound aus';
    }
    if (button) {
        button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    }
}

function setupOrientationToggle() {
    let button = document.getElementById('orientation-toggle');
    if (!button) return;
    button.addEventListener('click', function() {
        let key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
        let modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
        let current = localStorage.getItem(key) || 'auto';
        let nextMode = getNextOrientationMode(current, modes);
        localStorage.setItem(key, nextMode);
        updateLayout();
    });
}

function getNextOrientationMode(current, modes) {
    modes = modes || (window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape']);
    let index = modes.indexOf(current);
    if (index === -1) return modes[0];
    return modes[(index + 1) % modes.length];
}

function applyStoredOrientation() {
    let key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    let stored = localStorage.getItem(key) || 'auto';
    updateLayout(stored);
}

function applyOrientationMode(mode) {
    let button = document.getElementById('orientation-toggle');
    let modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
    let normalized = modes.includes(mode) ? mode : 'auto';
    document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
    document.body.classList.add('orientation-' + normalized);
    if (button) {
        let label = normalized === 'auto' ? 'Auto' : normalized === 'portrait' ? 'Hochformat' : 'Querformat';
        button.textContent = 'Ausrichtung: ' + label;
    }
}

function updateLayout(forcedMode) {
    if (!canvas || !fullscreenTarget) return;
    let key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    let modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
    let storedMode = forcedMode || localStorage.getItem(key) || 'auto';
    let mode = modes.includes(storedMode) ? storedMode : 'auto';
    let viewportOrientation = getViewportOrientation();
    let targetOrientation = mode === 'auto' ? viewportOrientation : mode;
    let isFullscreen = Boolean(document.fullscreenElement);
    let bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    let isMobile = window.innerWidth <= bp;
    applyOrientationMode(mode);
    resizeCanvas();
    applyFullscreenContainScale();
    document.body.classList.toggle('is-fullscreen', isFullscreen);
    let rotation = 0;
    if (isMobile && viewportOrientation === 'portrait') {
        rotation = 90;
    }
    let scale = computeContainScale(window.innerWidth, window.innerHeight, rotation);
    fullscreenTarget.style.transform = 'translate(-50%, -50%) rotate(' + rotation + 'deg) scale(' + scale + ')';
}

function getViewportOrientation() {
    if (window.matchMedia) {
        return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }
    return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
}

function computeContainScale(viewportWidth, viewportHeight, rotation) {
    let w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    let h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
    let normalized = ((rotation % 360) + 360) % 360;
    let rotated = normalized === 90 || normalized === 270;
    let baseWidth = rotated ? h : w;
    let baseHeight = rotated ? w : h;
    return Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
}