(function() {
    if (window.EPL && window.EPL.Controllers && window.EPL.Controllers.SoundToggle) return;
    window.EPL = window.EPL || {};
    window.EPL.Controllers = window.EPL.Controllers || {};

    function SoundToggleController(deps) {
        this.deps = deps;
        this.button = null;
        this.icon = null;
    }

    SoundToggleController.prototype.init = function() {
        this.button = document.getElementById('mute-toggle');
        this.icon = document.getElementById('mute-icon');
        if (!this.button || !this.icon) return;
        this.attachListener();
        this.updateIcon(this.deps.soundManager.isEnabled());
    };

    SoundToggleController.prototype.attachListener = function() {
        var self = this;
        this.button.addEventListener('click', function() {
            var next = self.deps.soundManager.toggle();
            self.updateIcon(next);
        });
    };

    SoundToggleController.prototype.updateIcon = function(enabled) {
        if (this.icon) {
            this.icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
            this.icon.alt = enabled ? 'Sound an' : 'Sound aus';
        }
        if (this.button) {
            this.button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
        }
    };

    window.EPL.Controllers.SoundToggle = SoundToggleController;
})();
