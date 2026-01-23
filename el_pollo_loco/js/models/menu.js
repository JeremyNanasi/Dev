const BACKGROUND_MUSIC_SRC = './img/backgroundmusic/backgroundmusic.mp3';
const SOUND_ENABLED_KEY = 'sound-enabled';
const ORIENTATION_MODE_KEY = 'orientation-mode';
const ORIENTATION_MODES = ['auto', 'portrait', 'landscape'];
const LANDSCAPE_ONLY_MAX_WIDTH = 900;

function ensureBackgroundMusic() {
    let audio = document.getElementById('background-music');

    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'background-music';
        audio.src = BACKGROUND_MUSIC_SRC;
        audio.loop = true;
        audio.preload = 'auto';
        audio.setAttribute('aria-hidden', 'true');
        document.body.appendChild(audio);
    }

    const tryPlay = () => {
        if (!isSoundEnabled()) {
            return;
        }
        audio.play().catch(() => {});
    };

    applySoundState(isSoundEnabled());
    tryPlay();

    const resumeOnInteraction = () => {
        tryPlay();
    };

    document.addEventListener('click', resumeOnInteraction, { once: true });
    document.addEventListener('keydown', resumeOnInteraction, { once: true });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            tryPlay();
        }
    });
}

function isSoundEnabled() {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
}

function applySoundState(enabled) {
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio) => {
        audio.muted = !enabled;
    });
}

function setupSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    if (!toggle) {
        return;
    }

    const updateToggle = (enabled) => {
        toggle.classList.toggle('is-off', !enabled);
        toggle.setAttribute('aria-pressed', enabled ? 'false' : 'true');
        const stateLabel = toggle.querySelector('[data-state]');
        if (stateLabel) {
            stateLabel.textContent = enabled ? 'an' : 'aus';
        }
    };

    toggle.addEventListener('click', () => {
        const nextEnabled = !isSoundEnabled();
        localStorage.setItem(SOUND_ENABLED_KEY, nextEnabled ? 'true' : 'false');
        applySoundState(nextEnabled);
        updateToggle(nextEnabled);
        if (nextEnabled) {
            document.getElementById('background-music')?.play().catch(() => {});
        }
    });

    const initial = isSoundEnabled();
    applySoundState(initial);
    updateToggle(initial);
}

function setupControlsToggle() {
    const toggleButton = document.getElementById('controls-toggle');
    const menuList = document.getElementById('controls-list');

    if (!toggleButton || !menuList) {
        return;
    }

    let expanded = false;

    const updateUi = () => {
        menuList.classList.toggle('collapsed', !expanded);
        toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggleButton.textContent = expanded ? 'Steuerung verbergen' : 'Steuerung anzeigen';
        toggleButton.classList.toggle('is-expanded', expanded);
        requestAnimationFrame(updateMenuScrollState);
    };

    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        updateUi();
    });

    updateUi();
}

function updateMenuScrollState() {
    const shell = document.getElementById('menu-shell');
    const toggleButton = document.getElementById('controls-toggle');
    if (!shell || !toggleButton) {
        return;
    }

    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    const isPortraitBlocked = document.body.classList.contains('orientation-blocked');
    if (!isExpanded || isPortraitBlocked) {
        shell.classList.remove('menu-scroll-allowed');
        return;
    }

    const needsScroll = shell.scrollHeight > shell.clientHeight + 4;
    shell.classList.toggle('menu-scroll-allowed', needsScroll);
}

function setupOrientationBlock() {
    const block = document.getElementById('orientation-block');
    if (!block) {
        return;
    }

    const update = () => {
        const isPortrait = window.matchMedia?.('(orientation: portrait)')?.matches
            ?? window.innerHeight > window.innerWidth;
        const shouldBlock = window.innerWidth <= LANDSCAPE_ONLY_MAX_WIDTH && isPortrait;
        block.classList.toggle('is-active', shouldBlock);
        block.setAttribute('aria-hidden', shouldBlock ? 'false' : 'true');
        document.body.classList.toggle('orientation-blocked', shouldBlock);
        updateMenuScrollState();
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
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

function computeContainScale(viewportWidth, viewportHeight, rotation, baseWidth, baseHeight) {
    const normalized = ((rotation % 360) + 360) % 360;
    const rotated = normalized === 90 || normalized === 270;
    const targetWidth = rotated ? baseHeight : baseWidth;
    const targetHeight = rotated ? baseWidth : baseHeight;
    return Math.min(viewportWidth / targetWidth, viewportHeight / targetHeight);
}

function updateMenuLayout() {
    const shell = document.getElementById('menu-shell');
    if (!shell) {
        return;
    }

    const storedMode = localStorage.getItem(ORIENTATION_MODE_KEY) || 'auto';
    const mode = ORIENTATION_MODES.includes(storedMode) ? storedMode : 'auto';
    const viewportOrientation = getViewportOrientation();
    const targetOrientation = mode === 'auto' ? viewportOrientation : mode;
    const rotation = getFallbackRotation(targetOrientation, viewportOrientation);
    const baseWidth = shell.offsetWidth || window.innerWidth;
    const baseHeight = shell.offsetHeight || window.innerHeight;
    const scale = computeContainScale(window.innerWidth, window.innerHeight, rotation, baseWidth, baseHeight);

    shell.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    ensureBackgroundMusic();
    setupSoundToggle();
    setupControlsToggle();
    setupOrientationBlock();
    updateMenuLayout();
    window.addEventListener('resize', updateMenuLayout);
    window.addEventListener('orientationchange', updateMenuLayout);
});
