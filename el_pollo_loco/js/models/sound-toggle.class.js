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
        let self = this;
        this.button.addEventListener('click', function() {
            let next = self.deps.soundManager.toggle();
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

    let SOUND_PATHS = {
        smallchickenLoop: './img/effect-sound/small-chicken.mp3',
        chickenLoop: './img/effect-sound/chicken.mp3',
        death: './img/effect-sound/chicken-death.mp3',
        endbossAlert: './img/effect-sound/angry-chicken.mp4'
    };

    let RANGE = 200;
    let INITIAL_DELAY_MIN = 400;
    let INITIAL_DELAY_MAX = 1000;
    let REPEAT_DELAY_MIN = 2600;
    let REPEAT_DELAY_MAX = 3200;

    class EnemySfxManager {
        constructor() {
            this.stateMap = new WeakMap();
        }

        update(world) {
            if (!this.isEnabled()) {
                this.stopAllActive(world);
                return;
            }
            if (!world?.level?.enemies || !world?.character) return;
            world.level.enemies.forEach(function(enemy) {
                this.processEnemy(enemy, world);
            }, this);
        }

        isEnabled() {
            return window.EPL?.Sound?.isEnabled?.() === true;
        }

        stopAllActive(world) {
            if (!world?.level?.enemies) return;
            world.level.enemies.forEach(function(enemy) {
                this.stopOne(enemy);
            }, this);
        }

        processEnemy(enemy, world) {
            let state = this.getOrCreateState(enemy);
            let type = this.getType(enemy);
            if (!type) return;
            let dead = this.isDead(enemy);
            this.handleDeath(enemy, state, dead);
            if (dead) return;
            this.handleAlert(enemy, state);
            this.handleLoop(enemy, state, world, type);
        }

        getOrCreateState(enemy) {
            if (!this.stateMap.has(enemy)) {
                this.stateMap.set(enemy, {
                    inRange: false,
                    started: false,
                    timeoutId: null,
                    deathPlayed: false,
                    wasAlerting: false
                });
            }
            return this.stateMap.get(enemy);
        }

        getType(enemy) {
            if (enemy instanceof smallchicken) return 'smallchicken';
            if (enemy instanceof Chicken) return 'chicken';
            if (enemy instanceof Endboss) return 'endboss';
            return null;
        }

        isDead(enemy) {
            if (typeof enemy.isDead === 'function' && enemy.isDead()) return true;
            if (enemy.isDeadState === true) return true;
            return enemy.energy <= 0;
        }

        handleDeath(enemy, state, dead) {
            if (!dead || state.deathPlayed) return;
            this.stopOne(enemy);
            this.playOnce(SOUND_PATHS.death);
            state.deathPlayed = true;
        }

        handleAlert(enemy, state) {
            if (!(enemy instanceof Endboss)) return;
            let alerting = enemy.isAlerting === true;
            let dead = this.isDead(enemy);
            if (!state.wasAlerting && alerting && !dead) {
                this.playOnce(SOUND_PATHS.endbossAlert);
            }
            state.wasAlerting = alerting;
        }

        handleLoop(enemy, state, world, type) {
            let inRange = this.isInRange(enemy, world);
            if (inRange && !state.inRange) {
                state.inRange = true;
                state.started = false;
                this.scheduleInitial(enemy, state, type);
            } else if (!inRange && state.inRange) {
                state.inRange = false;
                this.stopOne(enemy);
            }
        }

        isInRange(enemy, world) {
            let charX = world.character.x;
            let enemyX = enemy.x;
            return Math.abs(charX - enemyX) <= RANGE;
        }

        scheduleInitial(enemy, state, type) {
            let delay = this.randomBetween(INITIAL_DELAY_MIN, INITIAL_DELAY_MAX);
            let self = this;
            state.timeoutId = setTimeout(function() {
                self.playAndReschedule(enemy, state, type);
            }, delay);
        }

        // hier ist die zeit wann das kleine chicken einen sound macht
        scheduleNext(enemy, state, type) {
            let delay = this.randomBetween(REPEAT_DELAY_MIN, REPEAT_DELAY_MAX);
            let self = this;
            state.timeoutId = setTimeout(function() {
                self.playAndReschedule(enemy, state, type);
            }, delay);
        }

        playAndReschedule(enemy, state, type) {
            if (!state.inRange || this.isDead(enemy) || !this.isEnabled()) return;
            let src = this.getLoopSrc(type);
            this.playOnce(src);
            state.started = true;
            this.scheduleNext(enemy, state, type);
        }

        getLoopSrc(type) {
            if (type === 'smallchicken') return SOUND_PATHS.smallchickenLoop;
            if (type === 'chicken') return SOUND_PATHS.chickenLoop;
            return SOUND_PATHS.chickenLoop;
        }

        stopOne(enemy) {
            let state = this.stateMap.get(enemy);
            if (!state) return;
            if (state.timeoutId) {
                clearTimeout(state.timeoutId);
                state.timeoutId = null;
            }
            state.inRange = false;
            state.started = false;
        }

        playOnce(src) {
            if (!this.isEnabled()) return;
            let audio = new Audio(src);
            audio.volume = 0.5;
            audio.play().catch(function() {});
        }

        randomBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    window.EPL.EnemySfx = new EnemySfxManager();
})();
