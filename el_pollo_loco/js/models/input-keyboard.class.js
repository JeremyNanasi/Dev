/**
 * @fileoverview Keyboard input controller for gameplay and end-overlay navigation.
 */
(function() {
    try{sessionStorage.setItem('epl_index_ready','1')}catch(e){}
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.KeyboardInput) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    let KEYBOARD_CODE_MAP = {
        39: 'RIGHT',
        37: 'LEFT',
        38: 'UP',
        40: 'DOWN',
        32: 'SPACE',
        68: 'D'
    };

    /**
     * @param {{
     *   getKeyboard: function(): Keyboard,
     *   isBossDefeated: function(): boolean,
     *   getControlsLocked: function(): boolean,
     *   getEndOverlayShown: function(): boolean,
     *   navigateToMenu: function(): void
     * }} deps
     */
    function KeyboardInputController(deps) {
        this.deps = deps;
        this.keydownHandler = null;
        this.keyupHandler = null;
    }

    /**
     * Attaches global key listeners.
     * @returns {void}
     */
    KeyboardInputController.prototype.attach = function() {
        let self = this;
        this.keydownHandler = function(e) { self.handleKeydown(e); };
        this.keyupHandler = function(e) { self.handleKeyup(e); };
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    };

    KeyboardInputController.prototype.detach = function() {
        if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
        if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    };

    /**
     * Handles keydown and updates keyboard flags when input is allowed.
     * @param {KeyboardEvent} e
     * @returns {void}
     */
    KeyboardInputController.prototype.handleKeydown = function(e) {
        if (this.handleEnterMenu(e)) return;
        if (this.shouldIgnore()) return;
        this.setKey(e.keyCode, true);
    };

    KeyboardInputController.prototype.handleKeyup = function(e) {
        if (this.deps.isBossDefeated()) return;
        if (this.deps.getControlsLocked()) return;
        this.setKey(e.keyCode, false);
    };

    KeyboardInputController.prototype.handleEnterMenu = function(e) {
        if (!this.isEnterKey(e)) return false;
        let locked = this.deps.getControlsLocked();
        let shown = this.deps.getEndOverlayShown();
        let defeated = this.deps.isBossDefeated();
        if (shown || locked || defeated) {
            e.preventDefault();
            this.goToMenu();
            return true;
        }
        return false;
    };

    KeyboardInputController.prototype.isEnterKey = function(e) {
        return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    };

    KeyboardInputController.prototype.shouldIgnore = function() {
        return this.deps.isBossDefeated() || this.deps.getControlsLocked();
    };

    KeyboardInputController.prototype.setKey = function(keyCode, isPressed) {
        let key = KEYBOARD_CODE_MAP[keyCode];
        if (!key) return;
        let kb = this.deps.getKeyboard();
        if (kb) kb[key] = isPressed;
    };

    KeyboardInputController.prototype.reset = function() {
        let kb = this.deps.getKeyboard();
        if (!kb) return;
        Object.keys(KEYBOARD_CODE_MAP).forEach(function(code) {
            kb[KEYBOARD_CODE_MAP[code]] = false;
        });
    };

    KeyboardInputController.prototype.goToMenu = function() {
        let ref = document.referrer || '';
        if (ref.indexOf('menu.html') !== -1 && history.length > 1) {
            try { sessionStorage.setItem('epl_menu_back','1'); } catch (e) {}
            history.back();
            return;
        }
        this.deps.navigateToMenu();
    };

    KeyboardInputController.prototype.getCodeMap = function() {
        return KEYBOARD_CODE_MAP;
    };
    /** Handles `handlePageShow`. @returns {*} Result. */
    function handlePageShow() {
        let force = false;
        try { force = sessionStorage.getItem('epl_force_restart') === '1'; } catch (e) { force = false; }
        if (!force) return;
        try { sessionStorage.removeItem('epl_force_restart'); } catch (e) {}
        if (typeof init === 'function') init();
    }

    window.addEventListener('pageshow', handlePageShow);

    window.EPL.Controllers.KeyboardInput = KeyboardInputController;
})();
