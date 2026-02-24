try { sessionStorage.setItem('epl_index_ready', '1'); } catch (e) {}

window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.KeyboardInput = window.EPL.Controllers.KeyboardInput || class KeyboardInputController {
    /** Initialize keyboard input dependencies. @param {{isBossDefeated:Function,getControlsLocked:Function,getKeyboard:Function,getEndOverlayShown:Function,navigateToMenu:Function}} deps */
    constructor(deps) {
        this.deps = deps;
        this.keydownHandler = null;
        this.keyupHandler = null;
    }

    /** Return the keyCode-to-action map. @returns {{[key:number]: string}} */
    getCodeMap() {
        return { 39: 'RIGHT', 37: 'LEFT', 38: 'UP', 40: 'DOWN', 32: 'SPACE', 68: 'D' };
    }

    /** Attach keyboard listeners. */
    attach() {
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    /** Detach keyboard listeners. */
    detach() {
        if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
        if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    }

    /** Handle keydown events. @param {KeyboardEvent} e */
    handleKeydown(e) {
        if (this.handleEnterMenu(e)) return;
        if (this.shouldIgnore()) return;
        this.setKey(e.keyCode, true);
    }

    /** Handle keyup events. @param {KeyboardEvent} e */
    handleKeyup(e) {
        if (this.deps.isBossDefeated()) return;
        if (this.deps.getControlsLocked()) return;
        this.setKey(e.keyCode, false);
    }

    /** Handle enter navigation on end overlays. @param {KeyboardEvent} e @returns {boolean} */
    handleEnterMenu(e) {
        let blocked = this.deps.getEndOverlayShown() || this.deps.getControlsLocked() || this.deps.isBossDefeated();
        if (!this.isEnterKey(e) || !blocked) return false;
        e.preventDefault();
        this.goToMenu();
        return true;
    }

    /** Return whether the event is an enter key press. @param {KeyboardEvent} e @returns {boolean} */
    isEnterKey(e) {
        return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    }

    /** Return whether gameplay input should be ignored. @returns {boolean} */
    shouldIgnore() {
        return this.deps.isBossDefeated() || this.deps.getControlsLocked();
    }

    /** Set a mapped key state on the keyboard model. @param {number} keyCode @param {boolean} isPressed */
    setKey(keyCode, isPressed) {
        let map = this.getCodeMap();
        let key = map[keyCode];
        let kb = this.deps.getKeyboard();
        if (!key || !kb) return;
        kb[key] = isPressed;
    }

    /** Reset all mapped keys to false. */
    reset() {
        let kb = this.deps.getKeyboard();
        let map = this.getCodeMap();
        if (!kb) return;
        Object.keys(map).forEach(function(code) { kb[map[code]] = false; });
    }

    /** Navigate back to the menu page. */
    goToMenu() {
        let ref = document.referrer || '';
        if (ref.indexOf('menu.html') !== -1 && history.length > 1) {
            try { sessionStorage.setItem('epl_menu_back', '1'); } catch (e) {}
            history.back();
            return;
        }
        this.deps.navigateToMenu();
    }
};

if (!window.__epl_keyboard_pageshow_bound) {
    window.__epl_keyboard_pageshow_bound = true;
    window.addEventListener('pageshow', function() {
        let force = false;
        try { force = sessionStorage.getItem('epl_force_restart') === '1'; } catch (e) { force = false; }
        if (!force) return;
        try { sessionStorage.removeItem('epl_force_restart'); } catch (e) {}
        if (typeof init === 'function') init();
    });
}
