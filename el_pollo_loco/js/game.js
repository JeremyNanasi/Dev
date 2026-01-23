var canvas;
var world;
var keyboard = new Keyboard();
var fullscreenTarget;
var gameStarted = false;
var gameOverShown = false;
var gameOverOverlay;
var controlsLocked = false;
var endOverlayShown = false;
var endOverlayElement;
var fsHintEl = null;
var inlineHintEl = null;
var lastHintText = null;
var endOverlayActive = false;
var touchControlsInitialized = false;
var touchControlsVisible = false;
var touchUiMql;

var GAME_OVER_STYLE_ID = 'game-over-animations';
var KEYBOARD_CODE_MAP = {
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
    var handler = function() {
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
    var params = new URLSearchParams(window.location.search);
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
    var existing = document.getElementById('fullscreen-target');
    if (existing) {
        applyFullscreenTargetDefaults(existing);
        return existing;
    }
    var wrapper = document.createElement('div');
    wrapper.id = 'fullscreen-target';
    var parent = canvasEl.parentNode;
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
    var toggleButton = getFullscreenToggleButton();
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
    var isFullscreen = Boolean(document.fullscreenElement);
    toggleButton.textContent = isFullscreen ? 'Vollbild verlassen' : 'Vollbild';
    toggleButton.classList.toggle('is-active', isFullscreen);
}

function resizeCanvas() {
    if (!canvas) return;
    var w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    var h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
    canvas.width = w;
    canvas.height = h;
}

function applyFullscreenContainScale() {
    if (!fullscreenTarget) return;
    var w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    var h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
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
    var loop = function() {
        var status = getGameOverStatus();
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
    var boss = getBoss();
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
    var host = document.fullscreenElement === canvas ? fullscreenTarget : document.fullscreenElement;
    var target = host || document.body;
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
    var host = fullscreenTarget || (canvas ? canvas.parentNode : null);
    var parent = (host ? host.parentNode : null) || document.body;
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
        var key = KEYBOARD_CODE_MAP[code];
        keyboard[key] = false;
    });
}

function ensureGameOverStyles() {
    if (document.getElementById(GAME_OVER_STYLE_ID)) return;
    var style = buildGameOverStyleElement();
    document.head.appendChild(style);
}

function buildGameOverStyleElement() {
    var style = document.createElement('style');
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
    var key = KEYBOARD_CODE_MAP[keyCode];
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
    var buttons = Array.from(document.querySelectorAll('.touch-control-button'));
    if (!buttons.length) return;
    var keyToButton = new Map();
    var mousePressedKeys = new Set();
    var getKeysForButton = function(key) {
        if (key === 'SPACE' || key === 'UP') return ['SPACE', 'UP'];
        return [key];
    };
    buttons.forEach(function(button) {
        var key = button.dataset.key;
        if (!key) return;
        keyToButton.set(key, button);
        var handlePressStart = function(event, source) {
            if (shouldIgnoreInput()) return;
            event.preventDefault();
            var keys = getKeysForButton(key);
            keys.forEach(function(k) { keyboard[k] = true; });
            button.classList.add('is-pressed');
            if (source === 'mouse') mousePressedKeys.add(key);
        };
        var handlePressEnd = function(event) {
            event.preventDefault();
            var keys = getKeysForButton(key);
            var isJump = keys.includes('SPACE') || keys.includes('UP');
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
            var keys = (key === 'SPACE' || key === 'UP') ? ['SPACE', 'UP'] : [key];
            keys.forEach(function(k) { keyboard[k] = false; });
            var btn = keyToButton.get(key);
            if (btn) btn.classList.remove('is-pressed');
        });
        mousePressedKeys.clear();
    });
    touchControlsInitialized = true;
}

function setupMobileControlsToggle() {
    var toggle = document.getElementById('mobile-controls-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function() {
        touchControlsVisible = !touchControlsVisible;
        var key = window.EPL ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
        localStorage.setItem(key, touchControlsVisible ? 'on' : 'off');
        updateTouchControlsUI();
    });
}

function setupTouchControlsMediaQuery() {
    if (!window.matchMedia) return;
    var bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    touchUiMql = window.matchMedia('(max-width: ' + bp + 'px)');
    touchUiMql.addEventListener('change', updateTouchControlsVisibility);
}

function detectMobileTablet() {
    var hasTouchPoints = navigator.maxTouchPoints > 0;
    var coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    var noHover = window.matchMedia?.('(hover: none)')?.matches;
    return hasTouchPoints || (coarsePointer && noHover);
}

function updateMobileTabletState() {
    var detected = detectMobileTablet();
    document.body.classList.toggle('is-mobile-tablet', detected);
    return detected;
}

function setupMobileTabletDetection() {
    updateMobileTabletState();
}

function updateTouchControlsVisibility() {
    var key = window.EPL ? window.EPL.KEYS.TOUCH_CONTROLS : 'touch-controls-preference';
    var stored = localStorage.getItem(key);
    var isMobileTablet = document.body.classList.contains('is-mobile-tablet');
    var bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    var isWithinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= bp;
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
    var controls = document.getElementById('touch-controls');
    var toggle = document.getElementById('mobile-controls-toggle');
    var shouldShow = Boolean(touchControlsVisible);
    if (controls) controls.classList.toggle('is-visible', shouldShow);
    document.body.classList.toggle('touch-controls-visible', shouldShow);
    document.body.classList.toggle('touch-controls-hidden', !shouldShow);
    if (toggle) {
        toggle.textContent = shouldShow ? 'Mobile-Steuerung aus' : 'Mobile-Steuerung an';
    }
    var orientationToggle = document.getElementById('orientation-toggle');
    if (orientationToggle) {
        var bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
        var withinBreakpoint = touchUiMql ? touchUiMql.matches : window.innerWidth <= bp;
        orientationToggle.style.display = shouldShow || withinBreakpoint ? 'inline-flex' : 'none';
    }
}

function setupSoundToggleGame() {
    var button = document.getElementById('mute-toggle');
    var icon = document.getElementById('mute-icon');
    if (!button || !icon) return;
    button.addEventListener('click', function() {
        if (window.EPL && window.EPL.Sound) {
            var next = window.EPL.Sound.toggle();
            updateSoundIcon(next);
        }
    });
    var enabled = window.EPL && window.EPL.Sound ? window.EPL.Sound.isEnabled() : true;
    updateSoundIcon(enabled);
}

function updateSoundIcon(enabled) {
    var icon = document.getElementById('mute-icon');
    var button = document.getElementById('mute-toggle');
    if (icon) {
        icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
        icon.alt = enabled ? 'Sound an' : 'Sound aus';
    }
    if (button) {
        button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    }
}

function setupOrientationToggle() {
    var button = document.getElementById('orientation-toggle');
    if (!button) return;
    button.addEventListener('click', function() {
        var key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
        var modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
        var current = localStorage.getItem(key) || 'auto';
        var nextMode = getNextOrientationMode(current, modes);
        localStorage.setItem(key, nextMode);
        updateLayout();
    });
}

function getNextOrientationMode(current, modes) {
    modes = modes || (window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape']);
    var index = modes.indexOf(current);
    if (index === -1) return modes[0];
    return modes[(index + 1) % modes.length];
}

function applyStoredOrientation() {
    var key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    var stored = localStorage.getItem(key) || 'auto';
    updateLayout(stored);
}

function applyOrientationMode(mode) {
    var button = document.getElementById('orientation-toggle');
    var modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
    var normalized = modes.includes(mode) ? mode : 'auto';
    document.body.classList.remove('orientation-auto', 'orientation-portrait', 'orientation-landscape');
    document.body.classList.add('orientation-' + normalized);
    if (button) {
        var label = normalized === 'auto' ? 'Auto' : normalized === 'portrait' ? 'Hochformat' : 'Querformat';
        button.textContent = 'Ausrichtung: ' + label;
    }
}

function updateLayout(forcedMode) {
    if (!canvas || !fullscreenTarget) return;
    var key = window.EPL ? window.EPL.KEYS.ORIENTATION_MODE : 'orientation-mode';
    var modes = window.EPL ? window.EPL.ORIENTATION_MODES : ['auto', 'portrait', 'landscape'];
    var storedMode = forcedMode || localStorage.getItem(key) || 'auto';
    var mode = modes.includes(storedMode) ? storedMode : 'auto';
    var viewportOrientation = getViewportOrientation();
    var targetOrientation = mode === 'auto' ? viewportOrientation : mode;
    var isFullscreen = Boolean(document.fullscreenElement);
    var bp = window.EPL ? window.EPL.BREAKPOINT_MOBILE : 899;
    var isMobile = window.innerWidth <= bp;
    applyOrientationMode(mode);
    resizeCanvas();
    applyFullscreenContainScale();
    document.body.classList.toggle('is-fullscreen', isFullscreen);
    var rotation = 0;
    if (isMobile && viewportOrientation === 'portrait') {
        rotation = 90;
    }
    var scale = computeContainScale(window.innerWidth, window.innerHeight, rotation);
    fullscreenTarget.style.transform = 'translate(-50%, -50%) rotate(' + rotation + 'deg) scale(' + scale + ')';
}

function getViewportOrientation() {
    if (window.matchMedia) {
        return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    }
    return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
}

function computeContainScale(viewportWidth, viewportHeight, rotation) {
    var w = window.EPL ? window.EPL.DEFAULT_CANVAS_WIDTH : 720;
    var h = window.EPL ? window.EPL.DEFAULT_CANVAS_HEIGHT : 480;
    var normalized = ((rotation % 360) + 360) % 360;
    var rotated = normalized === 90 || normalized === 270;
    var baseWidth = rotated ? h : w;
    var baseHeight = rotated ? w : h;
    return Math.min(viewportWidth / baseWidth, viewportHeight / baseHeight);
}
