(function () {
  window.EPL = window.EPL || {};
  window.EPL.Controllers = window.EPL.Controllers || {};

  class EnemySfxManager {
    constructor() {
      this.stateMap = new WeakMap();
      this.orientationBlocked = false;
      this.lastWorld = null;
      this.SOUND_PATHS = {
        smallLoop: './img/effect-sound/small-chicken.mp3',
        chickenLoop: './img/effect-sound/chicken.mp3',
        death: './img/effect-sound/chicken-death.mp3',
        endbossAlert: './img/effect-sound/angry-chicken.mp4',
        damage: './img/effect-sound/damage.mp3'
      };
      this.RANGE = 1200;
      this.INIT_MIN = 400;
      this.INIT_MAX = 1000;
      this.REP_MIN = 2600;
      this.REP_MAX = 3200;
      this.bindOrientationEvents();
    }

    update(world) {
      if (!world?.level?.enemies || !world?.character) return;
      this.lastWorld = world;
      if (this.orientationBlocked) return this.stopAll(world.level.enemies);
      if (!this.isEnabled()) return this.stopAll(world.level.enemies);
      for (let i = 0; i < world.level.enemies.length; i++) {
        this.processEnemy(world.character, world.level.enemies[i]);
      }
    }

    isEnabled() {
      return window.EPL?.Sound?.isEnabled?.() === true && !this.orientationBlocked;
    }

    bindOrientationEvents() {
      const self = this;
      window.addEventListener('epl:orientation-blocked', function(e) {
        self.setOrientationBlocked(Boolean(e?.detail?.blocked));
      });
    }

    setOrientationBlocked(blocked) {
      this.orientationBlocked = blocked;
      if (!blocked) return;
      if (this.lastWorld?.level?.enemies) this.stopAll(this.lastWorld.level.enemies);
    }

    processEnemy(character, enemy) {
      const type = this.getType(enemy);
      if (!type) return;
      const st = this.getState(enemy);
      if (this.isDead(enemy)) return this.handleDeath(enemy, st);
      this.handleAlert(enemy, st);
      this.handleLoop(character, enemy, st, type);
    }

    getType(enemy) {
      if (enemy?.constructor?.name === 'smallchicken') return 'small';
      if (enemy?.constructor?.name === 'Chicken') return 'chicken';
      if (enemy?.constructor?.name === 'Endboss') return 'endboss';
      return null;
    }

    getState(enemy) {
      if (!this.stateMap.has(enemy)) {
        this.stateMap.set(enemy, {
          inRange: false,
          timeoutId: null,
          deathPlayed: false,
          blocked: false,
          wasAlerting: false,
          wasHurting: false,
          currentAudio: null,
          damageActive: false,
          damageCooldownUntil: 0,
          damageTimeoutId: null,
          damageAudio: null,
          deathLocked: false
        });
      }
      return this.stateMap.get(enemy);
    }

    isDead(enemy) {
      if (typeof enemy?.isDead === 'function' && enemy.isDead()) return true;
      if (enemy?.isDeadState === true) return true;
      if (typeof enemy?.energy === 'number') return enemy.energy <= 0;
      return false;
    }

    handleDeath(enemy, st) {
      if (st.blocked) return;
      st.deathLocked = true;
      this.stopDamage(st);
      st.blocked = true;
      this.stopEnemy(st);
      if (!st.deathPlayed) this.playDeathOnce(st);
    }

    playDeathOnce(st) {
      if (!this.isEnabled()) return;
      st.deathPlayed = true;
      const a = new Audio(this.SOUND_PATHS.death);
      a.volume = 0.6;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    handleAlert(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      if (st.damageActive || st.deathLocked) return;
      const alerting = enemy?.isAlerting === true;
      if (!st.wasAlerting && alerting && !st.blocked) this.playAlert(st);
      st.wasAlerting = alerting;
    }

    playAlert(st) {
      if (!this.isEnabled()) return;
      if (st.blocked) return;
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.7;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    onEndbossAlertStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.damageActive || st.deathLocked) return;
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.7;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    onEndbossHurtStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.deathLocked) return;
      if (Date.now() < st.damageCooldownUntil) return;
      this.startDamage(endboss, st);
    }

    handleHurt(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      const hurting = enemy?.isHurting === true;
      if (!st.wasHurting && hurting) this.onEndbossHurtStart(enemy);
      st.wasHurting = hurting;
    }

    handleLoop(character, enemy, st, type) {
      if (st.blocked) return;
      this.handleHurt(enemy, st);
      if (enemy?.constructor?.name === 'Endboss' && st.damageActive) return;
      const inRange = this.isInRange(character, enemy);
      if (inRange && !st.inRange) return this.enterRange(enemy, st, type);
      if (!inRange && st.inRange) return this.exitRange(st);
    }

    isInRange(character, enemy) {
      const cx = character?.x ?? 0;
      const ex = enemy?.x ?? 0;
      return Math.abs(cx - ex) <= this.RANGE;
    }

    enterRange(enemy, st, type) {
      st.inRange = true;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.schedule(enemy, st, type, this.rand(this.INIT_MIN, this.INIT_MAX));
    }

    exitRange(st) {
      st.inRange = false;
      this.stopEnemy(st);
    }

    schedule(enemy, st, type, delay) {
      st.timeoutId = setTimeout(() => {
        if (!this.isEnabled()) return;
        if (!st.inRange) return;
        if (st.blocked) return;
        if (enemy?.constructor?.name === 'Endboss' && st.damageActive) return;
        if (this.isDead(enemy)) return this.handleDeath(enemy, st);
        this.playLoopOnce(st, this.loopSrc(type));
        this.schedule(enemy, st, type, this.rand(this.REP_MIN, this.REP_MAX));
      }, delay);
    }

    loopSrc(type) {
      if (type === 'small') return this.SOUND_PATHS.smallLoop;
      return this.SOUND_PATHS.chickenLoop;
    }

    playLoopOnce(st, src) {
      this.stopCurrentAudio(st);
      const a = new Audio(src);
      a.volume = 0.5;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    stopAll(enemies) {
      for (let i = 0; i < enemies.length; i++) this.stopOne(enemies[i]);
    }

    stopOne(enemy) {
      const st = this.stateMap.get(enemy);
      if (!st) return;
      this.stopEnemy(st);
    }

    stopEnemy(st) {
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.stopDamage(st);
      st.inRange = false;
    }

    clearTimer(st) {
      if (!st.timeoutId) return;
      clearTimeout(st.timeoutId);
      st.timeoutId = null;
    }

    stopCurrentAudio(st) {
      const a = st.currentAudio;
      if (!a) return;
      a.pause();
      a.currentTime = 0;
      st.currentAudio = null;
    }

    startDamage(endboss, st) {
      if (!this.isEnabled() || this.isDead(endboss) || st.blocked || st.deathLocked) return;
      st.damageActive = true;
      st.damageCooldownUntil = Date.now() + 300;
      st.inRange = false;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.damage);
      a.volume = 0.6;
      st.damageAudio = a;
      const self = this;
      a.addEventListener('ended', function () { self.stopDamage(st); });
      a.play().catch(() => {});
      st.damageTimeoutId = setTimeout(function () { self.stopDamage(st); }, 800);
    }

    stopDamage(st) {
      if (st.damageTimeoutId) {
        clearTimeout(st.damageTimeoutId);
        st.damageTimeoutId = null;
      }
      if (st.damageAudio) {
        st.damageAudio.pause();
        st.damageAudio.currentTime = 0;
        st.damageAudio = null;
      }
      st.damageActive = false;
    }

    rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }

  function SoundToggleController(deps) {
    this.deps = deps;
    this.button = null;
    this.icon = null;
  }

  SoundToggleController.prototype.init = function () {
    this.button = document.getElementById('mute-toggle');
    this.icon = document.getElementById('mute-icon');
    if (!this.button || !this.icon) return;
    this.attachListener();
    this.updateIcon(this.deps.soundManager.isEnabled());
  };

  SoundToggleController.prototype.attachListener = function () {
    const self = this;
    this.button.addEventListener('click', function () {
      const next = self.deps.soundManager.toggle();
      self.updateIcon(next);
    });
  };

  SoundToggleController.prototype.updateIcon = function (enabled) {
    if (this.icon) {
      this.icon.src = enabled ? './img/mobile/sound.png' : './img/mobile/mute.png';
      this.icon.alt = enabled ? 'Sound an' : 'Sound aus';
    }
    if (this.button) {
      this.button.setAttribute('aria-pressed', enabled ? 'false' : 'true');
    }
  };

  if (!window.EPL.Controllers.SoundToggle) {
    window.EPL.Controllers.SoundToggle = SoundToggleController;
  }

  if (!window.EPL.EnemySfx) {
    window.EPL.EnemySfx = new EnemySfxManager();
  }
})();
