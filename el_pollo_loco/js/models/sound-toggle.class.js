(function () {
  window.EPL = window.EPL || {};
  window.EPL.Controllers = window.EPL.Controllers || {};

  class EnemySfxManager {
    /** Creates a new instance. */
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
      this.loopPools = this.createLoopPools();
      this.RANGE = 1200;
      this.INIT_MIN = 400;
      this.INIT_MAX = 1000;
      this.REP_MIN = 2600;
      this.REP_MAX = 3200;
      this.bindOrientationEvents();
    }
    /** Updates `update` state. @param {*} world - Value. @returns {*} Result. */
    update(world) {
      if (!world?.level?.enemies || !world?.character) return;
      this.lastWorld = world;
      if (this.orientationBlocked) return this.stopAll(world.level.enemies);
      if (!this.isEnabled()) return this.stopAll(world.level.enemies);
      for (let i = 0; i < world.level.enemies.length; i++) {
        this.processEnemy(world.character, world.level.enemies[i]);
      }
    }
    /** Checks `isEnabled`. @returns {*} Result. */
    isEnabled() {
      return window.EPL?.Sound?.isEnabled?.() === true && !this.orientationBlocked;
    }
    /** Runs `bindOrientationEvents`. */
    bindOrientationEvents() {
      const self = this;
      window.addEventListener('epl:orientation-blocked', function(e) {
        self.setOrientationBlocked(Boolean(e?.detail?.blocked));
      });
    }
    /** Sets `setOrientationBlocked` state. @param {*} blocked - Value. @returns {*} Result. */
    setOrientationBlocked(blocked) {
      this.orientationBlocked = blocked;
      if (!blocked) return;
      if (this.lastWorld?.level?.enemies) this.stopAll(this.lastWorld.level.enemies);
    }
    /** Runs `processEnemy`. @param {*} character - Value. @param {*} enemy - Value. @returns {*} Result. */
    processEnemy(character, enemy) {
      const type = this.getType(enemy);
      if (!type) return;
      const st = this.getState(enemy);
      if (this.isDead(enemy)) return this.handleDeath(enemy, st);
      this.handleAlert(enemy, st);
      this.handleLoop(character, enemy, st, type);
    }
    /** Gets `getType` data. @param {*} enemy - Value. @returns {*} Result. */
    getType(enemy) {
      if (enemy?.constructor?.name === 'smallchicken') return 'small';
      if (enemy?.constructor?.name === 'Chicken') return 'chicken';
      if (enemy?.constructor?.name === 'Endboss') return 'endboss';
      return null;
    }
    /** Gets `getState` data. @param {*} enemy - Value. @returns {*} Result. */
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
    /** Checks `isDead`. @param {*} enemy - Value. @returns {*} Result. */
    isDead(enemy) {
      if (typeof enemy?.isDead === 'function' && enemy.isDead()) return true;
      if (enemy?.isDeadState === true) return true;
      if (typeof enemy?.energy === 'number') return enemy.energy <= 0;
      return false;
    }
    /** Handles `handleDeath`. @param {*} enemy - Value. @param {*} st - Value. @returns {*} Result. */
    handleDeath(enemy, st) {
      if (st.blocked) return;
      st.deathLocked = true;
      this.stopDamage(st);
      st.blocked = true;
      this.stopEnemy(st);
      if (!st.deathPlayed) this.playDeathOnce(st);
    }
    /** Runs `playDeathOnce`. @param {*} st - Value. @returns {*} Result. */
    playDeathOnce(st) {
      if (!this.isEnabled()) return;
      st.deathPlayed = true;
      const a = new Audio(this.SOUND_PATHS.death);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }
    /** Handles `handleAlert`. @param {*} enemy - Value. @param {*} st - Value. @returns {*} Result. */
    handleAlert(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      if (st.damageActive || st.deathLocked) return;
      const alerting = enemy?.isAlerting === true;
      if (!st.wasAlerting && alerting && !st.blocked) this.playAlert(st);
      st.wasAlerting = alerting;
    }
    /** Runs `playAlert`. @param {*} st - Value. @returns {*} Result. */
    playAlert(st) {
      if (!this.isEnabled()) return;
      if (st.blocked) return;
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }
    /** Runs `onEndbossAlertStart`. @param {*} endboss - Value. @returns {*} Result. */
    onEndbossAlertStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.damageActive || st.deathLocked) return;
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }
    /** Runs `onEndbossHurtStart`. @param {*} endboss - Value. @returns {*} Result. */
    onEndbossHurtStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.deathLocked) return;
      if (Date.now() < st.damageCooldownUntil) return;
      this.startDamage(endboss, st);
    }
    /** Handles `handleHurt`. @param {*} enemy - Value. @param {*} st - Value. @returns {*} Result. */
    handleHurt(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      const hurting = enemy?.isHurting === true;
      if (!st.wasHurting && hurting) this.onEndbossHurtStart(enemy);
      st.wasHurting = hurting;
    }
    /** Handles `handleLoop`. @param {*} character - Value. @param {*} enemy - Value. @param {*} st - Value. @param {*} type - Value. @returns {*} Result. */
    handleLoop(character, enemy, st, type) {
      if (st.blocked) return;
      this.handleHurt(enemy, st);
      if (enemy?.constructor?.name === 'Endboss' && st.damageActive) return;
      const inRange = this.isInRange(character, enemy);
      if (inRange && !st.inRange) return this.enterRange(enemy, st, type);
      if (!inRange && st.inRange) return this.exitRange(st);
    }
    /** Checks `isInRange`. @param {*} character - Value. @param {*} enemy - Value. @returns {*} Result. */
    isInRange(character, enemy) {
      const cx = character?.x ?? 0;
      const ex = enemy?.x ?? 0;
      return Math.abs(cx - ex) <= this.RANGE;
    }
    /** Runs `enterRange`. @param {*} enemy - Value. @param {*} st - Value. @param {*} type - Value. */
    enterRange(enemy, st, type) {
      st.inRange = true;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.schedule(enemy, st, type, this.rand(this.INIT_MIN, this.INIT_MAX));
    }
    /** Runs `exitRange`. @param {*} st - Value. */
    exitRange(st) {
      st.inRange = false;
      this.stopEnemy(st);
    }
    /** Runs `schedule`. @param {*} enemy - Value. @param {*} st - Value. @param {*} type - Value. @param {*} delay - Value. @returns {*} Result. */
    schedule(enemy, st, type, delay) {
      st.timeoutId = setTimeout(() => {
        if (!this.isEnabled()) return;
        if (!st.inRange) return;
        if (st.blocked) return;
        if (enemy?.constructor?.name === 'Endboss' && st.damageActive) return;
        if (this.isDead(enemy)) return this.handleDeath(enemy, st);
        this.playLoopOnce(st, type);
        this.schedule(enemy, st, type, this.rand(this.REP_MIN, this.REP_MAX));
      }, delay);
    }
    /** Runs `loopSrc`. @param {*} type - Value. @returns {*} Result. */
    loopSrc(type) {
      if (type === 'small') return this.SOUND_PATHS.smallLoop;
      return this.SOUND_PATHS.chickenLoop;
    }
    /** Creates `createLoopPools` data. @returns {*} Result. */
    createLoopPools() {
      return {
        chicken: this.buildPool(this.SOUND_PATHS.chickenLoop, 2),
        small: this.buildPool(this.SOUND_PATHS.smallLoop, 1)
      };
    }
    /** Creates `buildPool` data. @param {*} src - Value. @param {*} size - Value. @returns {*} Result. */
    buildPool(src, size) {
      const pool = [];
      for (let i = 0; i < size; i++) pool.push(this.prepareLoopAudio(new Audio(src)));
      return pool;
    }
    /** Runs `prepareLoopAudio`. @param {*} a - Value. @returns {*} Result. */
    prepareLoopAudio(a) {
      a.addEventListener('ended', () => {
        if (a._owner?.currentAudio === a) a._owner.currentAudio = null;
        a._owner = null;
      });
      return a;
    }
    /** Checks `isLimitedType`. @param {*} type - Value. @returns {*} Result. */
    isLimitedType(type) {
      return type === 'small' || type === 'chicken';
    }
    /** Gets `getLoopPool` data. @param {*} type - Value. @returns {*} Result. */
    getLoopPool(type) {
      return type === 'small' ? this.loopPools.small : this.loopPools.chicken;
    }
    /** Checks `isAudioPlaying`. @param {*} a - Value. @returns {*} Result. */
    isAudioPlaying(a) {
      return a && !a.paused && !a.ended;
    }
    /** Runs `countActiveInPool`. @param {*} pool - Value. @returns {*} Result. */
    countActiveInPool(pool) {
      let count = 0;
      for (let i = 0; i < pool.length; i++) if (this.isAudioPlaying(pool[i])) count++;
      return count;
    }
    /** Runs `countActiveLoops`. @returns {*} Result. */
    countActiveLoops() {
      return this.countActiveInPool(this.loopPools.chicken)
        + this.countActiveInPool(this.loopPools.small);
    }
    /** Runs `acquireLoopAudio`. @param {*} type - Value. @returns {*} Result. */
    acquireLoopAudio(type) {
      if (this.countActiveLoops() >= 3) return null;
      const pool = this.getLoopPool(type);
      for (let i = 0; i < pool.length; i++) if (!this.isAudioPlaying(pool[i])) return pool[i];
      return null;
    }
    /** Runs `startPooledAudio`. @param {*} st - Value. @param {*} a - Value. */
    startPooledAudio(st, a) {
      a.currentTime = 0;
      a.volume = 0.2;
      a._owner = st;
      st.currentAudio = a;
      a.play().catch(() => {});
    }
    /** Runs `playUncappedLoop`. @param {*} st - Value. @param {*} src - Value. */
    playUncappedLoop(st, src) {
      this.stopCurrentAudio(st);
      const a = new Audio(src);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }
    /** Runs `playLoopOnce`. @param {*} st - Value. @param {*} type - Value. @returns {*} Result. */
    playLoopOnce(st, type) {
      const src = this.loopSrc(type);
      if (!this.isLimitedType(type)) return this.playUncappedLoop(st, src);
      const a = this.acquireLoopAudio(type);
      if (!a) return;
      this.stopCurrentAudio(st);
      this.startPooledAudio(st, a);
    }
    /** Runs `stopAll`. @param {*} enemies - Value. */
    stopAll(enemies) {
      for (let i = 0; i < enemies.length; i++) this.stopOne(enemies[i]);
    }
    /** Runs `stopOne`. @param {*} enemy - Value. @returns {*} Result. */
    stopOne(enemy) {
      const st = this.stateMap.get(enemy);
      if (!st) return;
      this.stopEnemy(st);
    }
    /** Runs `stopEnemy`. @param {*} st - Value. */
    stopEnemy(st) {
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.stopDamage(st);
      st.inRange = false;
    }
    /** Runs `clearTimer`. @param {*} st - Value. @returns {*} Result. */
    clearTimer(st) {
      if (!st.timeoutId) return;
      clearTimeout(st.timeoutId);
      st.timeoutId = null;
    }
    /** Runs `stopCurrentAudio`. @param {*} st - Value. @returns {*} Result. */
    stopCurrentAudio(st) {
      const a = st.currentAudio;
      if (!a) return;
      if (a._owner && a._owner !== st) {
        st.currentAudio = null;
        return;
      }
      a.pause();
      a.currentTime = 0;
      a._owner = null;
      st.currentAudio = null;
    }
    /** Runs `startDamage`. @param {*} endboss - Value. @param {*} st - Value. @returns {*} Result. */
    startDamage(endboss, st) {
      if (!this.isEnabled() || this.isDead(endboss) || st.blocked || st.deathLocked) return;
      st.damageActive = true;
      st.damageCooldownUntil = Date.now() + 300;
      st.inRange = false;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      const a = new Audio(this.SOUND_PATHS.damage);
      a.volume = 0.2;
      st.damageAudio = a;
      const self = this;
      a.addEventListener('ended', function () { self.stopDamage(st); });
      a.play().catch(() => {});
      st.damageTimeoutId = setTimeout(function () { self.stopDamage(st); }, 800);
    }
    /** Runs `stopDamage`. @param {*} st - Value. */
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
    /** Runs `rand`. @param {*} min - Value. @param {*} max - Value. @returns {*} Result. */
    rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  /** Runs `SoundToggleController`. @param {*} deps - Value. */
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
