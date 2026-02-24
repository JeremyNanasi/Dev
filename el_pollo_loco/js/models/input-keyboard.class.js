try { sessionStorage.setItem('epl_index_ready', '1'); } catch (e) {}

window.EPL = window.EPL || {};
window.EPL.Controllers = window.EPL.Controllers || {};

window.EPL.Controllers.KeyboardInput = window.EPL.Controllers.KeyboardInput || class KeyboardInputController {
    constructor(deps) {
        this.deps = deps;
        this.keydownHandler = null;
        this.keyupHandler = null;
    }

    getCodeMap() {
        return { 39: 'RIGHT', 37: 'LEFT', 38: 'UP', 40: 'DOWN', 32: 'SPACE', 68: 'D' };
    }

    attach() {
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    detach() {
        if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
        if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    }

    handleKeydown(e) {
        if (this.handleEnterMenu(e)) return;
        if (this.shouldIgnore()) return;
        this.setKey(e.keyCode, true);
    }

    handleKeyup(e) {
        if (this.deps.isBossDefeated()) return;
        if (this.deps.getControlsLocked()) return;
        this.setKey(e.keyCode, false);
    }

    handleEnterMenu(e) {
        var blocked = this.deps.getEndOverlayShown() || this.deps.getControlsLocked() || this.deps.isBossDefeated();
        if (!this.isEnterKey(e) || !blocked) return false;
        e.preventDefault();
        this.goToMenu();
        return true;
    }

    isEnterKey(e) {
        return e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.keyCode === 13;
    }

    shouldIgnore() {
        return this.deps.isBossDefeated() || this.deps.getControlsLocked();
    }

    setKey(keyCode, isPressed) {
        var map = this.getCodeMap();
        var key = map[keyCode];
        var kb = this.deps.getKeyboard();
        if (!key || !kb) return;
        kb[key] = isPressed;
    }

    reset() {
        var kb = this.deps.getKeyboard();
        var map = this.getCodeMap();
        if (!kb) return;
        Object.keys(map).forEach(function(code) { kb[map[code]] = false; });
    }

    goToMenu() {
        var ref = document.referrer || '';
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
        var force = false;
        try { force = sessionStorage.getItem('epl_force_restart') === '1'; } catch (e) { force = false; }
        if (!force) return;
        try { sessionStorage.removeItem('epl_force_restart'); } catch (e) {}
        if (typeof init === 'function') init();
    });
}
