/** Enemy SFX and sound toggle integration, including loop management and per-entity sound safety helpers. Encapsulates SFX state using weak references to avoid leaking entity instances. */
(function () {
  window.EPL = window.EPL || {};
  window.EPL.Controllers = window.EPL.Controllers || {};
  class EnemySfxManager {

    /** Initializes a new methods instance and sets up default runtime state. The constructor prepares dependencies used by class behavior. */
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

    /** Updates routine. This synchronizes runtime state with current inputs. */
    update(world) {
      if (!world?.level?.enemies || !world?.character) return;
      this.lastWorld = world;
      if (this.orientationBlocked) return this.stopAll(world.level.enemies);
      if (!this.isEnabled()) return this.stopAll(world.level.enemies);
      for (let i = 0; i < world.level.enemies.length; i++) {
        this.processEnemy(world.character, world.level.enemies[i]);
      }
    }

    /** Evaluates the enabled condition. Returns whether the current runtime state satisfies that condition. */
    isEnabled() {
      return window.EPL?.Sound?.isEnabled?.() === true && !this.orientationBlocked;
    }
    /** Binds orientation events. The operation is isolated here to keep behavior predictable. */
    bindOrientationEvents() {
      const self = this;
      window.addEventListener('epl:orientation-blocked', function(e) {
        self.setOrientationBlocked(Boolean(e?.detail?.blocked));
      });
    }

    /** Sets the orientation blocked. This keeps persistent and in-memory state aligned. */
    setOrientationBlocked(blocked) {
      this.orientationBlocked = blocked;
      if (!blocked) return;
      if (this.lastWorld?.level?.enemies) this.stopAll(this.lastWorld.level.enemies);
    }

    /** Executes the process enemy routine. The logic is centralized here for maintainability. */
    processEnemy(character, enemy) {
      const type = this.getType(enemy);
      if (!type) return;
      const st = this.getState(enemy);
      if (this.isDead(enemy)) return this.handleDeath(enemy, st);
      this.handleAlert(enemy, st);
      this.handleLoop(character, enemy, st, type);
    }

    /** Returns the type. This helper centralizes read access for callers. */
    getType(enemy) {
      if (enemy?.constructor?.name === 'smallchicken') return 'small';
      if (enemy?.constructor?.name === 'Chicken') return 'chicken';
      if (enemy?.constructor?.name === 'Endboss') return 'endboss';
      return null;
    }

    /** Returns the state. This helper centralizes read access for callers. */
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

    /** Evaluates the dead condition. Returns whether the current runtime state satisfies that condition. */
    isDead(enemy) {
      if (typeof enemy?.isDead === 'function' && enemy.isDead()) return true;
      if (enemy?.isDeadState === true) return true;
      if (typeof enemy?.energy === 'number') return enemy.energy <= 0;
      return false;
    }

    /** Handles death. It applies side effects required by this branch. */
    handleDeath(enemy, st) {
      if (st.blocked) return;
      st.deathLocked = true;
      this.stopDamage(st);
      st.blocked = true;
      this.stopEnemy(st);
      if (!st.deathPlayed) this.playDeathOnce(st);
    }

    /** Plays death once. The operation is isolated here to keep behavior predictable. */
    playDeathOnce(st) {
      if (!this.isEnabled()) return;
      st.deathPlayed = true;
      const a = (window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(this.SOUND_PATHS.death) : new Audio(this.SOUND_PATHS.death);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    /** Handles alert. It applies side effects required by this branch. */
    handleAlert(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      if (st.damageActive || st.deathLocked) return;
      const alerting = enemy?.isAlerting === true;
      if (!st.wasAlerting && alerting && !st.blocked) this.playAlert(st);
      st.wasAlerting = alerting;
    }

    /** Plays alert. The operation is isolated here to keep behavior predictable. */
    playAlert(st) {
      if (!this.isEnabled()) return;
      if (st.blocked) return;
      this.stopCurrentAudio(st);
      const a = (window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(this.SOUND_PATHS.endbossAlert) : new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    /** Handles endboss alert start. It applies side effects required by this branch. */
    onEndbossAlertStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.damageActive || st.deathLocked) return;
      this.stopCurrentAudio(st);
      const a = (window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(this.SOUND_PATHS.endbossAlert) : new Audio(this.SOUND_PATHS.endbossAlert);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    /** Handles endboss hurt start. It applies side effects required by this branch. */
    onEndbossHurtStart(endboss) {
      if (!this.isEnabled()) return;
      const st = this.getState(endboss);
      if (this.isDead(endboss) || st.blocked || st.deathLocked) return;
      if (Date.now() < st.damageCooldownUntil) return;
      this.startDamage(endboss, st);
    }

    /** Handles hurt. It applies side effects required by this branch. */
    handleHurt(enemy, st) {
      if (enemy?.constructor?.name !== 'Endboss') return;
      const hurting = enemy?.isHurting === true;
      if (!st.wasHurting && hurting) this.onEndbossHurtStart(enemy);
      st.wasHurting = hurting;
    }

    /** Handles loop. It applies side effects required by this branch. */
    handleLoop(character, enemy, st, type) {
      if (st.blocked) return;
      this.handleHurt(enemy, st);
      if (enemy?.constructor?.name === 'Endboss' && st.damageActive) return;
      const inRange = this.isInRange(character, enemy);
      if (inRange && !st.inRange) return this.enterRange(enemy, st, type);
      if (!inRange && st.inRange) return this.exitRange(st);
    }

    /** Evaluates the in range condition. Returns whether the current runtime state satisfies that condition. */
    isInRange(character, enemy) {
      const cx = character?.x ?? 0;
      const ex = enemy?.x ?? 0;
      return Math.abs(cx - ex) <= this.RANGE;
    }

    /** Handles entering range. The operation is isolated here to keep behavior predictable. */
    enterRange(enemy, st, type) {
      st.inRange = true;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.schedule(enemy, st, type, this.rand(this.INIT_MIN, this.INIT_MAX));
    }

    /** Handles leaving range. The operation is isolated here to keep behavior predictable. */
    exitRange(st) {
      st.inRange = false;
      this.stopEnemy(st);
    }

    /** Schedules routine. The operation is isolated here to keep behavior predictable. */
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

    /** Executes the loop src routine. The logic is centralized here for maintainability. */
    loopSrc(type) {
      if (type === 'small') return this.SOUND_PATHS.smallLoop;
      return this.SOUND_PATHS.chickenLoop;
    }

    /** Creates loop pools. The result is consumed by downstream game logic. */
    createLoopPools() {
      return {
        chicken: this.buildPool(this.SOUND_PATHS.chickenLoop, 2),
        small: this.buildPool(this.SOUND_PATHS.smallLoop, 1)
      };
    }

    /** Creates pool. The result is consumed by downstream game logic. */
    buildPool(src, size) {
      const pool = [];
      for (let i = 0; i < size; i++) pool.push(this.prepareLoopAudio((window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(src) : new Audio(src)));
      return pool;
    }

    /** Executes the prepare loop audio routine. The logic is centralized here for maintainability. */
    prepareLoopAudio(a) {
      a.addEventListener('ended', () => {
        if (a._owner?.currentAudio === a) a._owner.currentAudio = null;
        a._owner = null;
      });
      return a;
    }

    /** Evaluates the limited type condition. Returns whether the current runtime state satisfies that condition. */
    isLimitedType(type) {
      return type === 'small' || type === 'chicken';
    }

    /** Returns the loop pool. This helper centralizes read access for callers. */
    getLoopPool(type) {
      return type === 'small' ? this.loopPools.small : this.loopPools.chicken;
    }

    /** Evaluates the audio playing condition. Returns whether the current runtime state satisfies that condition. */
    isAudioPlaying(a) {
      return a && !a.paused && !a.ended;
    }

    /** Executes the count active in pool routine. The logic is centralized here for maintainability. */
    countActiveInPool(pool) {
      let count = 0;
      for (let i = 0; i < pool.length; i++) if (this.isAudioPlaying(pool[i])) count++;
      return count;
    }

    /** Executes the count active loops routine. The logic is centralized here for maintainability. */
    countActiveLoops() {
      return this.countActiveInPool(this.loopPools.chicken)
        + this.countActiveInPool(this.loopPools.small);
    }

    /** Executes the acquire loop audio routine. The logic is centralized here for maintainability. */
    acquireLoopAudio(type) {
      if (this.countActiveLoops() >= 3) return null;
      const pool = this.getLoopPool(type);
      for (let i = 0; i < pool.length; i++) if (!this.isAudioPlaying(pool[i])) return pool[i];
      return null;
    }

    /** Starts pooled audio. The operation is isolated here to keep behavior predictable. */
    startPooledAudio(st, a) {
      a.currentTime = 0;
      a.volume = 0.2;
      a._owner = st;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    /** Plays uncapped loop. The operation is isolated here to keep behavior predictable. */
    playUncappedLoop(st, src) {
      this.stopCurrentAudio(st);
      const a = (window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(src) : new Audio(src);
      a.volume = 0.2;
      st.currentAudio = a;
      a.play().catch(() => {});
    }

    /** Plays loop once. The operation is isolated here to keep behavior predictable. */
    playLoopOnce(st, type) {
      const src = this.loopSrc(type);
      if (!this.isLimitedType(type)) return this.playUncappedLoop(st, src);
      const a = this.acquireLoopAudio(type);
      if (!a) return;
      this.stopCurrentAudio(st);
      this.startPooledAudio(st, a);
    }

    /** Stops all. The operation is isolated here to keep behavior predictable. */
    stopAll(enemies) {
      for (let i = 0; i < enemies.length; i++) this.stopOne(enemies[i]);
    }

    /** Stops one. The operation is isolated here to keep behavior predictable. */
    stopOne(enemy) {
      const st = this.stateMap.get(enemy);
      if (!st) return;
      this.stopEnemy(st);
    }

    /** Stops enemy. The operation is isolated here to keep behavior predictable. */
    stopEnemy(st) {
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      this.stopDamage(st);
      st.inRange = false;
    }

    /** Executes the clear timer routine. The logic is centralized here for maintainability. */
    clearTimer(st) {
      if (!st.timeoutId) return;
      clearTimeout(st.timeoutId);
      st.timeoutId = null;
    }

    /** Stops current audio. The operation is isolated here to keep behavior predictable. */
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

    /** Starts damage. The operation is isolated here to keep behavior predictable. */
    startDamage(endboss, st) {
      if (!this.isEnabled() || this.isDead(endboss) || st.blocked || st.deathLocked) return;
      st.damageActive = true;
      st.damageCooldownUntil = Date.now() + 300;
      st.inRange = false;
      this.clearTimer(st);
      this.stopCurrentAudio(st);
      const a = (window.EPL && window.EPL.Sound && window.EPL.Sound.createSfx) ? window.EPL.Sound.createSfx(this.SOUND_PATHS.damage) : new Audio(this.SOUND_PATHS.damage);
      a.volume = 0.2;
      st.damageAudio = a;
      const self = this;
      a.addEventListener('ended', function () { self.stopDamage(st); });
      a.play().catch(() => {});
      st.damageTimeoutId = setTimeout(function () { self.stopDamage(st); }, 800);
    }

    /** Stops damage. The operation is isolated here to keep behavior predictable. */
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

    /** Generates routine. The result is randomized within the configured range. */
    rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  if (!window.EPL.EnemySfx) {
    window.EPL.EnemySfx = new EnemySfxManager();
  }
})();
