/**
 * @fileoverview
 * Provides `RestartButtonResetService`, a small helper that resets world/level state for a soft-restart flow.
 *
 * The service coordinates cleanup (enemy SFX, loops, intervals), re-creates level/actors, re-initializes collision,
 * refreshes HUD state, and re-attaches keyboard input.
 */
class RestartButtonResetService {
  /**
   * Creates a reset service bound to a controller that exposes runtime dependencies (e.g. canvas).
   * @param {Object} controller - Controller object that provides access to runtime dependencies.
   */
  constructor(controller) {
    this.controller = controller;
  }

  /**
   * Stops enemy SFX in a defensive way (guards against missing world, enemy list, or sound manager).
   */
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

  /**
   * Resets the global game-over state using the available runtime hook, if present.
   */
  resetGameOver() {
    this.callIfFn('resetGameOverState');
  }

  /**
   * Restarts the game-over watcher using the available runtime hook, if present.
   */
  restartGameOverWatcher() {
    this.callIfFn('startGameOverWatcher');
  }

  /**
   * Executes the soft-restart sequence: resumes sounds, rebinds keyboard, and resets world state.
   */
  restartGame() {
    this.resumeAllSoundsAfterBossGate(); this.detachKeyboard(); this.resetWorldState(); this.attachKeyboard();
  }

  /**
   * Clears end-state sound gating and resumes audio playback after a win/lose audio gate, if supported by the sound layer.
   */
  resumeAllSoundsAfterBossGate() {
    const sound = window.EPL?.Sound;
    if (!sound) return;
    if (typeof sound.clearEndStateMute === 'function') { sound.clearEndStateMute(); return; }
    if (typeof sound.disableWhitelistGate === 'function') sound.disableWhitelistGate();
    if (typeof sound.resumeFromEnd === 'function') sound.resumeFromEnd();
  }

  /**
   * Detaches keyboard listeners via the global controllers registry, if available.
   */
  detachKeyboard() {
    if (typeof controllers !== 'undefined' && controllers?.keyboard?.detach) controllers.keyboard.detach();
  }

  /**
   * Attaches keyboard listeners via the global controllers registry, if available.
   */
  attachKeyboard() {
    if (typeof controllers !== 'undefined' && controllers?.keyboard?.attach) controllers.keyboard.attach();
  }

  /**
   * Rebuilds and returns the active level instance (prefers the global init hook when present).
   * @returns {Level|null} The rebuilt level instance, or null when no level could be created.
   */
  resetLevel() {
    const level = this.callIfFn('initLevel') || this.buildLevel1();
    if (level) window.level1 = level;
    return level || window.level1 || null;
  }

  /**
   * Deactivates all runtime actors (enemies and character) to prevent old intervals/loops from leaking into the new world state.
   * @param {World} world - Active world instance whose actors should be deactivated.
   */
  deactivateActors(world) {
    const actors = (world?.level?.enemies || []).slice();
    if (world?.character) actors.push(world.character);
    for (let i = 0; i < actors.length; i++) this.deactivateActor(actors[i]);
  }

  /**
   * Deactivates a single actor by removing world reference, forcing a dead-like state, and stopping known loops/intervals.
   * @param {Object} actor - Actor instance (enemy or character) to deactivate.
   */
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

  /**
   * Resets the world state by rebuilding the level, re-creating runtime actors, re-initializing collision, and refreshing HUD.
   */
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

  /**
   * Applies a new level instance onto the given world.
   * @param {World} world - World instance receiving the new level.
   * @param {Level} level - New level instance to apply.
   */
  applyLevel(world, level) {
    if (!world || !level) return;
    world.level = level;
  }

  /**
   * Re-creates the character and resets throwable/collectible runtime counters on the given world.
   * @param {World} world - World instance whose actor state is reset.
   */
  resetActors(world) {
    const character = this.createCharacter();
    if (character) world.character = character;
    world.throwableObject = [];
    world.collectedSalsa = 0;
    world.lastThrowTime = 0;
  }

  /**
   * Creates a new character instance if the global `Character` constructor is available.
   * @returns {Character|null} A new character instance, or null when the constructor is unavailable.
   */
  createCharacter() {
    if (typeof Character !== 'function') return null;
    return new Character();
  }

  /**
   * Resets key world runtime flags/counters and reinitializes status bars.
   * @param {World} world - World instance to update.
   */
  resetWorldValues(world) {
    world.camera_x = 0;
    world.gameOverStartTime = null;
    world.winStartTime = null;
    world.endAudioStopped = false;
    this.resetStatusBars(world);
  }

  /**
   * Re-creates all HUD status bars on the world if the `StatusBar` constructor exists.
   * @param {World} world - World instance receiving the HUD bars.
   */
  resetStatusBars(world) {
    if (typeof StatusBar !== 'function') return;
    world.statusBar = new StatusBar();
    world.iconsStatusBar = new StatusBar('icons');
    world.bottlesStatusBar = new StatusBar('bottles');
  }

  /**
   * Reinitializes collision handling for the world if `WorldCollision` exists.
   * @param {World} world - World instance receiving the collision engine.
   */
  resetCollision(world) {
    if (typeof WorldCollision !== 'function') return;
    world.collision = new WorldCollision(world);
  }

  /**
   * Refreshes cached HUD elements and updates collectible totals using world methods when present.
   * @param {World} world - World instance whose HUD should be refreshed.
   */
  refreshWorldHud(world) {
    this.callWorld(world, 'cacheHudElements');
    this.callWorld(world, 'setWorld');
    this.callWorld(world, 'setCollectibleTotals');
    this.callWorld(world, 'refreshHud');
  }

  /**
   * Calls a no-arg method on the world if it exists.
   * @param {World} world - World instance that may implement the method.
   * @param {string} name - Method name to call.
   */
  callWorld(world, name) {
    const fn = world && world[name];
    if (typeof fn !== 'function') return;
    fn.call(world);
  }

  /**
   * Builds and returns a `Level` instance matching the default level1 composition.
   * @returns {Level|null} The built level, or null when `Level` is not available.
   */
  buildLevel1() {
    if (typeof Level !== 'function') return null;
    return new Level(this.buildEnemies(), this.buildClouds(), this.buildIcons(), this.buildSalsa(), this.buildBackgrounds());
  }

  /**
   * Builds the enemy list (standard chickens, small chickens, and the endboss).
   * @returns {Array<Chicken|smallchicken|Endboss>} The assembled enemy list.
   */
  buildEnemies() {
    return this.repeat(() => new Chicken(), 5)
      .concat(this.repeat(() => new smallchicken({ isSmall: true }), 4), [new Endboss()]);
  }

  /**
   * Builds the cloud list for the level.
   * @returns {Array<Cloud>} The assembled cloud list.
   */
  buildClouds() {
    return this.repeat(() => new Cloud(), 12);
  }

  /**
   * Builds the coin/icon collectibles list with randomized X positions.
   * @returns {Array<Icons>} The assembled icons list.
   */
  buildIcons() {
    return this.repeat(() => new Icons({ x: this.randomIconX() }), 20);
  }

  /**
   * Generates a randomized X coordinate used for icon/coin placement.
   * @returns {number} Randomized X coordinate in pixels.
   */
  randomIconX() {
    return -750 + Math.random() * 750 * 3 + 800;
  }

  /**
   * Builds the collectible bottle list using the bottle spawn helper.
   * @returns {Array<ThrowableObject>} The assembled list of collectible bottles.
   */
  buildSalsa() {
    return this.repeat(() => new ThrowableObject(this.getBottleX(), 360, { isCollectible: true }), 9);
  }

  /**
   * Resolves the bottle spawn X coordinate.
   *
   * Uses the global `randomBottleX()` helper when present; otherwise falls back to the configured min/max globals
   * (or safe numeric defaults).
   *
   * @returns {number} Bottle X coordinate in pixels.
   */
  getBottleX() {
    if (typeof randomBottleX === 'function') return randomBottleX();
    const min = typeof bottleMinX === 'number' ? bottleMinX : 200;
    const max = typeof bottleMaxX === 'number' ? bottleMaxX : 2000;
    return min + Math.random() * (max - min);
  }

  /**
   * Builds the background layer objects by concatenating multiple background sets.
   * @returns {Array<BackgroundObject>} Flattened list of background objects.
   */
  buildBackgrounds() {
    const sets = [this.createBackgroundSet(-750, 2), this.createBackgroundSet(0, 1), this.createBackgroundSet(750, 2), this.createBackgroundSet(1500, 1), this.createBackgroundSet(2250, 2), this.createBackgroundSet(3000, 1)];
    return sets.reduce((all, set) => all.concat(set), []);
  }

  /**
   * Creates a single background set (air + 3 parallax layers) at the given X offset and sprite variant.
   * @param {number} x - Base X offset for this background set.
   * @param {number} variant - Sprite variant selector (e.g. 1 or 2) used in layer path names.
   * @returns {Array<BackgroundObject>} The background objects created for this set.
   */
  createBackgroundSet(x, variant) {
    const v = String(variant);
    return [new BackgroundObject('./img/5_background/layers/air.png', x), new BackgroundObject(`./img/5_background/layers/3_third_layer/${v}.png`, x), new BackgroundObject(`./img/5_background/layers/2_second_layer/${v}.png`, x), new BackgroundObject(`./img/5_background/layers/1_first_layer/${v}.png`, x)];
  }

  /**
   * Utility helper to create an array by calling a factory callback a fixed number of times.
   * @template T
   * @param {function(): T} fn - Factory callback invoked once per item.
   * @param {number} count - Number of items to create.
   * @returns {T[]} The assembled items array.
   */
  repeat(fn, count) {
    const items = [];
    for (let i = 0; i < count; i++) items.push(fn());
    return items;
  }

  /**
   * Calls a global function by name (or path) if it exists and is callable.
   * @param {string} name - Global function name or dotted path (e.g. 'initLevel' or 'EPL.Sound.resumeFromEnd').
   * @param {...unknown} args - Arguments forwarded to the resolved function.
   * @returns {unknown|null} The resolved function return value, or null when no callable function exists.
   */
  callIfFn(name, ...args) {
    const fn = this.resolveFn(name);
    if (typeof fn !== 'function') return null;
    return fn(...args);
  }

  /**
   * Resolves a function/value by a global name or dotted property path on `window`.
   * @param {string} name - Global name or dotted path to resolve.
   * @returns {unknown|null} The resolved value, or null when resolution fails.
   */
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

  /**
   * Creates a new `World` instance using the controller canvas (or #canvas) and the resolved keyboard state.
   *
   * Writes to the global `world` variable when it exists; otherwise assigns `window.world`.
   */
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

  /**
   * Resolves the active keyboard instance (prefers existing globals, otherwise creates a new `Keyboard`).
   * @returns {Keyboard|null} The keyboard instance, or null when it cannot be resolved/created.
   */
  resolveKeyboard() {
    if (typeof keyboard !== 'undefined') return keyboard; if (window.keyboard) return window.keyboard;
    if (typeof Keyboard === 'function') return new Keyboard(); if (window.Keyboard) return new window.Keyboard();
    return null;
  }

  /**
   * Returns the active world instance from globals when available.
   * @returns {World|null} The active world, or null when it is not available.
   */
  getWorld() {
    if (window.world) return window.world; if (typeof world !== 'undefined') return world;
    return null;
  }
}