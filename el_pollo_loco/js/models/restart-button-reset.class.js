/**
 * Performs world and level reset operations for soft restart flow.
 */
class RestartButtonResetService {
  /**
   * @param {Object} controller
   */
  constructor(controller) {
    this.controller = controller;
  }
  /** Runs `stopEnemySfxSafe`. @returns {*} Result. */
  stopEnemySfxSafe() {
    const w = this.getWorld();
    const enemies = w && w.level && w.level.enemies;
    const mgr = window.EPL && window.EPL.EnemySfx;
    if (!enemies || !mgr) return;
    if (typeof mgr.stopAll !== 'function') return;
    if (typeof mgr.stopOne !== 'function') return;
    try {
      mgr.stopAll.call(mgr, enemies);
    } catch (_) {}
  }
  /** Runs `resetGameOver`. */
  resetGameOver() {
    this.callIfFn('resetGameOverState');
  }
  /** Runs `restartGameOverWatcher`. */
  restartGameOverWatcher() {
    this.callIfFn('startGameOverWatcher');
  }

  /**
   * Rebuilds world state while preserving controller wiring.
   * @returns {void}
   */
  restartGame() {
    this.resumeAllSoundsAfterBossGate(); this.detachKeyboard(); this.resetWorldState(); this.attachKeyboard();
  }
  /** Runs `resumeAllSoundsAfterBossGate`. @returns {*} Result. */
  resumeAllSoundsAfterBossGate() {
    const sound = window.EPL?.Sound;
    if (!sound) return;
    if (typeof sound.clearEndStateMute === 'function') { sound.clearEndStateMute(); return; }
    if (typeof sound.disableWhitelistGate === 'function') sound.disableWhitelistGate();
    if (typeof sound.resumeFromEnd === 'function') sound.resumeFromEnd();
  }
  /** Runs `detachKeyboard`. */
  detachKeyboard() {
    if (typeof controllers !== 'undefined' && controllers?.keyboard?.detach) controllers.keyboard.detach();
  }
  /** Runs `attachKeyboard`. */
  attachKeyboard() {
    if (typeof controllers !== 'undefined' && controllers?.keyboard?.attach) controllers.keyboard.attach();
  }
  /** Runs `resetLevel`. @returns {*} Result. */
  resetLevel() {
    const level = this.callIfFn('initLevel') || this.buildLevel1();
    if (level) window.level1 = level;
    return level || window.level1 || null;
  }
  /** Runs `deactivateActors`. @param {*} world - Value. */
  deactivateActors(world) {
    const actors = (world?.level?.enemies || []).slice();
    if (world?.character) actors.push(world.character);
    for (let i = 0; i < actors.length; i++) this.deactivateActor(actors[i]);
  }
  /** Runs `deactivateActor`. @param {*} actor - Value. @returns {*} Result. */
  deactivateActor(actor) {
    if (!actor) return;
    actor.world = null;
    if (typeof actor.energy === 'number') actor.energy = 0;
    if ('isDeadState' in actor) actor.isDeadState = true;
    const fn = actor.stopLoopSound;
    if (typeof fn === 'function') fn.call(actor);
    const clear = actor.clearIntervalsForDeath; if (typeof clear === 'function') clear.call(actor);
    const logic = actor.logic;
    if (typeof logic?.clearMovementInterval === 'function') logic.clearMovementInterval();
  }
  /** Runs `resetWorldState`. @returns {*} Result. */
  resetWorldState() {
    const w = this.getWorld();
    if (!w) return;
    this.deactivateActors(w);
    const level = this.resetLevel();
    this.applyLevel(w, level);
    this.resetActors(w);
    this.resetWorldValues(w);
    this.resetCollision(w);
    this.refreshWorldHud(w);
  }
  /** Runs `applyLevel`. @param {*} world - Value. @param {*} level - Value. @returns {*} Result. */
  applyLevel(world, level) {
    if (!world || !level) return;
    world.level = level;
  }
  /** Runs `resetActors`. @param {*} world - Value. */
  resetActors(world) {
    const character = this.createCharacter();
    if (character) world.character = character;
    world.throwableObject = [];
    world.collectedSalsa = 0;
    world.lastThrowTime = 0;
  }
  /** Creates `createCharacter` data. @returns {*} Result. */
  createCharacter() {
    if (typeof Character !== 'function') return null;
    return new Character();
  }
  /** Runs `resetWorldValues`. @param {*} world - Value. */
  resetWorldValues(world) {
    world.camera_x = 0;
    world.gameOverStartTime = null;
    world.winStartTime = null;
    world.endAudioStopped = false;
    this.resetStatusBars(world);
  }
  /** Runs `resetStatusBars`. @param {*} world - Value. @returns {*} Result. */
  resetStatusBars(world) {
    if (typeof StatusBar !== 'function') return;
    world.statusBar = new StatusBar();
    world.iconsStatusBar = new StatusBar('icons');
    world.bottlesStatusBar = new StatusBar('bottles');
  }
  /** Runs `resetCollision`. @param {*} world - Value. @returns {*} Result. */
  resetCollision(world) {
    if (typeof WorldCollision !== 'function') return;
    world.collision = new WorldCollision(world);
  }
  /** Runs `refreshWorldHud`. @param {*} world - Value. */
  refreshWorldHud(world) {
    this.callWorld(world, 'cacheHudElements');
    this.callWorld(world, 'setWorld');
    this.callWorld(world, 'setCollectibleTotals');
    this.callWorld(world, 'refreshHud');
  }
  /** Runs `callWorld`. @param {*} world - Value. @param {*} name - Value. @returns {*} Result. */
  callWorld(world, name) {
    const fn = world && world[name];
    if (typeof fn !== 'function') return;
    fn.call(world);
  }

  /**
   * Reconstructs `level1` with fresh entities.
   * @returns {Level|null}
   */
  buildLevel1() {
    if (typeof Level !== 'function') return null;
    return new Level(this.buildEnemies(), this.buildClouds(), this.buildIcons(), this.buildSalsa(), this.buildBackgrounds());
  }
  /** Creates `buildEnemies` data. @returns {*} Result. */
  buildEnemies() {
    return this.repeat(() => new Chicken(), 5)
      .concat(this.repeat(() => new smallchicken({ isSmall: true }), 4), [new Endboss()]);
  }
  /** Creates `buildClouds` data. @returns {*} Result. */
  buildClouds() {
    return this.repeat(() => new Cloud(), 12);
  }
  /** Creates `buildIcons` data. @returns {*} Result. */
  buildIcons() {
    return this.repeat(() => new Icons({ x: this.randomIconX() }), 20);
  }
  /** Runs `randomIconX`. @returns {*} Result. */
  randomIconX() {
    return -750 + Math.random() * 750 * 3 + 800;
  }
  /** Creates `buildSalsa` data. @returns {*} Result. */
  buildSalsa() {
    return this.repeat(() => new ThrowableObject(this.getBottleX(), 360, { isCollectible: true }), 9);
  }
  /** Gets `getBottleX` data. @returns {*} Result. */
  getBottleX() {
    if (typeof randomBottleX === 'function') return randomBottleX();
    const min = typeof bottleMinX === 'number' ? bottleMinX : 200;
    const max = typeof bottleMaxX === 'number' ? bottleMaxX : 2000;
    return min + Math.random() * (max - min);
  }
  /** Creates `buildBackgrounds` data. @returns {*} Result. */
  buildBackgrounds() {
    const sets = [this.createBackgroundSet(-750, 2), this.createBackgroundSet(0, 1), this.createBackgroundSet(750, 2), this.createBackgroundSet(1500, 1), this.createBackgroundSet(2250, 2), this.createBackgroundSet(3000, 1)];
    return sets.reduce((all, set) => all.concat(set), []);
  }
  /** Creates `createBackgroundSet` data. @param {*} x - Value. @param {*} variant - Value. @returns {*} Result. */
  createBackgroundSet(x, variant) {
    const v = String(variant);
    return [new BackgroundObject('./img/5_background/layers/air.png', x), new BackgroundObject(`./img/5_background/layers/3_third_layer/${v}.png`, x), new BackgroundObject(`./img/5_background/layers/2_second_layer/${v}.png`, x), new BackgroundObject(`./img/5_background/layers/1_first_layer/${v}.png`, x)];
  }
  /** Runs `repeat`. @param {*} fn - Value. @param {*} count - Value. @returns {*} Result. */
  repeat(fn, count) {
    const items = [];
    for (let i = 0; i < count; i++) items.push(fn());
    return items;
  }
  /** Runs `callIfFn`. @param {*} name - Value. @param {*} args - Value. @returns {*} Result. */
  callIfFn(name, ...args) {
    const fn = this.resolveFn(name);
    if (typeof fn !== 'function') return null;
    return fn(...args);
  }
  /** Runs `resolveFn`. @param {*} name - Value. @returns {*} Result. */
  resolveFn(name) {
    if (!name) return null;
    if (typeof name === 'function') return name;
    if (typeof name !== 'string') return null;
    const parts = name.split('.');
    let target = window;
    for (let i = 0; i < parts.length; i++) {
      if (!target) return null;
      target = target[parts[i]];
    }
    return target;
  }
  /** Creates `createWorld` data. @returns {*} Result. */
  createWorld() {
    const canvas = this.controller.canvas || document.getElementById('canvas');
    if (!canvas || typeof World !== 'function') return;
    const kb = this.resolveKeyboard();
    if (typeof world !== 'undefined') {
      world = new World(canvas, kb);
      return;
    }
    window.world = new World(canvas, kb);
  }
  /** Runs `resolveKeyboard`. @returns {*} Result. */
  resolveKeyboard() {
    if (typeof keyboard !== 'undefined') return keyboard; if (window.keyboard) return window.keyboard;
    if (typeof Keyboard === 'function') return new Keyboard(); if (window.Keyboard) return new window.Keyboard();
    return null;
  }
  /** Gets `getWorld` data. @returns {*} Result. */
  getWorld() {
    if (window.world) return window.world; if (typeof world !== 'undefined') return world;
    return null;
  }
}
