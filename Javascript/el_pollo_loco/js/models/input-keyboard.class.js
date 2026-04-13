/**
 * @fileoverview
 * Provides keyboard input handling for the game by mapping keydown/keyup events to the shared `Keyboard` state.
 *
 * This controller also supports Enter-key navigation back to the menu when an end overlay is shown or controls are locked.
 */

try { sessionStorage.setItem('epl_index_ready', '1'); } catch (e) {}
window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

/**
 * @typedef {Object} KeyboardInputDeps
 * @property {function(): boolean} isBossDefeated - Returns whether the boss has been defeated (win state active).
 * @property {function(): boolean} getControlsLocked - Returns whether gameplay controls are currently locked.
 * @property {function(): (Keyboard|null|undefined)} getKeyboard - Returns the shared keyboard state object.
 * @property {function(): boolean} getEndOverlayShown - Returns whether an end overlay (win/game-over) is currently visible.
 * @property {function(): void} navigateToMenu - Navigates to the menu page as a fallback when history navigation is not possible.
 */

window.EPL.Controllers.KeyboardInput = window.EPL.Controllers.KeyboardInput || class KeyboardInputController {

    /**
     * Creates a keyboard input controller using dependency callbacks from the runtime environment.
     * @param {KeyboardInputDeps} deps - Dependency callbacks used to query game state and access the shared keyboard model.
     */
    constructor(deps) {
        this.deps = deps;
        this.keydownHandler = null;
        this.keyupHandler = null;
    }

    /**
     * Returns the keyCode-to-keyboard-property mapping used by this controller.
     * @returns {Object.<number, string>} A mapping from keyCode to `Keyboard` property name (e.g. 37 -> 'LEFT').
     */
    getCodeMap() {
        return { 39: 'RIGHT', 37: 'LEFT', 38: 'UP', 40: 'DOWN', 32: 'SPACE', 68: 'D' };
    }

    /**
     * Attaches keydown/keyup listeners and stores the bound handler references for later cleanup.
     */
    attach() {
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    /**
     * Detaches keydown/keyup listeners if they were previously attached.
     */
    detach() {
        if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
        if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    }

    /**
     * Handles keydown events and updates the shared keyboard state unless input is currently blocked.
     * @param {KeyboardEvent} e - Keyboard event for the pressed key.
     */
    handleKeydown(e) {
        if (this.handleEnterMenu(e)) return;
        if (this.shouldIgnore()) return;
        this.setKey(e.keyCode, true);
    }

    /**
     * Handles keyup events and clears the shared keyboard state unless input is currently blocked.
     * @param {KeyboardEvent} e - Keyboard event for the released key.
     */
    handleKeyup(e) {
        if (this.deps.isBossDefeated()) return;
        if (this.deps.getControlsLocked()) return;
        this.setKey(e.keyCode, false);
    }

    /**
     * Handles Enter navigation back to the menu when an end overlay is shown or controls are locked.
     * @param {KeyboardEvent} e - Keyboard event to evaluate.
     * @returns {boolean} True if the event was handled as menu navigation; otherwise false.
     */
    handleEnterMenu(e) {
        let blocked = this.deps.getEndOverlayShown() || this.deps.getControlsLocked() || this.deps.isBossDefeated();
        if (!this.isEnterKey(e) || !blocked) return false;
        e.preventDefault();
        this.goToMenu();
        return true;
    }

    /**
     * Checks whether the given keyboard event represents an Enter key press.
     * @param {KeyboardEvent} e - Keyboard event to evaluate.
     * @returns {boolean} True if Enter (including NumpadEnter) was pressed; otherwise false.
     */
    isEnterKey(e) {
        return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    }

    /**
     * Determines whether gameplay input should be ignored due to locked controls or boss defeat.
     * @returns {boolean} True if input should be ignored; otherwise false.
     */
    shouldIgnore() {
        return this.deps.isBossDefeated() || this.deps.getControlsLocked();
    }

    /**
     * Sets a mapped key state on the shared `Keyboard` model.
     * @param {number} keyCode - Numeric keyCode provided by the keyboard event.
     * @param {boolean} isPressed - True to set the key as pressed; false to clear it.
     */
    setKey(keyCode, isPressed) {
        let map = this.getCodeMap();
        let key = map[keyCode];
        let kb = this.deps.getKeyboard();
        if (!key || !kb) return;
        kb[key] = isPressed;
    }

    /**
     * Resets all mapped keyboard flags to false on the shared `Keyboard` model.
     */
    reset() {
        let kb = this.deps.getKeyboard();
        let map = this.getCodeMap();
        if (!kb) return;
        Object.keys(map).forEach(function(code) { kb[map[code]] = false; });
    }

    /**
     * Navigates back to the menu page, preferring browser history when possible.
     */
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