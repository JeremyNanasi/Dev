const KEYBOARD_CODE_MAP = {
    39: 'RIGHT',
    37: 'LEFT',
    38: 'UP',
    40: 'DOWN',
    32: 'SPACE',
    68: 'D'
};

class KeyboardInputManager {
    constructor(keyboard, options = {}) {
        this.keyboard = keyboard;
        this.getControlsLocked = options.getControlsLocked || (() => false);
        this.getEndOverlayShown = options.getEndOverlayShown || (() => false);
        this.isBossDefeated = options.isBossDefeated || (() => false);
        this.navigateToMenu = options.navigateToMenu || (() => {});

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (this.handleEnterMenuNavigation(e)) {
            return;
        }
        if (this.handleLockedEnter(e)) {
            return;
        }
        if (this.shouldIgnoreInput()) {
            return;
        }
        this.setKeyboardState(e.keyCode, true);
    }

    handleKeyUp(e) {
        if (this.isBossDefeated()) {
            return;
        }

        if (this.getControlsLocked()) {
            return;
        }

        this.setKeyboardState(e.keyCode, false);
    }

    handleEnterMenuNavigation(e) {
        if (this.isEnterKey(e) && (this.getEndOverlayShown() || this.getControlsLocked() || this.isBossDefeated())) {
            e.preventDefault();
            this.navigateToMenu();
            return true;
        }
        return false;
    }

    handleLockedEnter(e) {
        if ((this.getControlsLocked() || this.getEndOverlayShown()) && this.isEnterKey(e)) {
            e.preventDefault();
            this.navigateToMenu();
            return true;
        }

        return false;
    }

    shouldIgnoreInput() {
        return this.isBossDefeated() || this.getControlsLocked();
    }

    isEnterKey(e) {
        return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    }

    setKeyboardState(keyCode, isPressed) {
        const key = KEYBOARD_CODE_MAP[keyCode];
        if (!key) {
            return;
        }

        this.keyboard[key] = isPressed;
    }

    resetKeyboard() {
        Object.keys(KEYBOARD_CODE_MAP).forEach(code => {
            const key = KEYBOARD_CODE_MAP[code];
            this.keyboard[key] = false;
        });
    }
}
