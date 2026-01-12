const BACKGROUND_MUSIC_SRC = './img/backgroundmusic/backgroundmusic.mp3';

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
        audio.play().catch(() => {});
    };

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

document.addEventListener('DOMContentLoaded', () => {
    ensureBackgroundMusic();
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
    };

    toggleButton.addEventListener('click', () => {
        expanded = !expanded;
        updateUi();
    });

    updateUi();
});