import { create } from "zustand";
import { STORAGE_KEY, type GameState, type Rock, type UpgradeLevels } from "./types";
import { UPGRADES, upgradeCost, canAfford, type UpgradeKey } from "./upgrades";
import { droneDps, goldReward, resolveTapHit, potentialPrestigeStars } from "./formulas";
import { spawnRock, spawnInitialRocks, ROCKS_ON_SCREEN, ROCKS_PER_ZONE_ADVANCE } from "./rocks";

export const OFFLINE_CAP_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface RockHit {
  id: string;
  damage: number;
  broke: boolean;
}

export interface MinePulseResult {
  isCrit: boolean;
  hits: RockHit[];
}

export interface OfflineResult {
  elapsedMs: number;
  gold: number;
}

export interface GameActions {
  /** Damages the given rock ids by one mining pulse (crit rolled once for the whole pulse). */
  mineRocks: (ids: string[]) => MinePulseResult;
  tick: (now: number) => void;
  buyUpgrade: (key: UpgradeKey) => boolean;
  canPrestige: () => boolean;
  doPrestige: () => number;
  buyStarUpgrade: () => boolean;
  resolveOfflineProgress: () => OfflineResult | null;
  save: () => void;
  hardReset: () => void;
}

export type GameStore = GameState & GameActions;

function freshUpgrades(): UpgradeLevels {
  return { pickaxe: 0, drone: 0, goldenChance: 0, goldenMulti: 0, critChance: 0, critMulti: 0, miningRadius: 0 };
}

function freshState(): GameState {
  const upgrades = freshUpgrades();
  return {
    gold: 0,
    gems: 0,
    stars: 0,
    totalGoldEarned: 0,
    totalGoldEarnedThisPrestige: 0,
    prestigeCount: 0,
    zoneIndex: 0,
    rocksClearedInZone: 0,
    rocks: spawnInitialRocks(upgrades, 0, ROCKS_ON_SCREEN),
    upgrades,
    starUpgrades: { goldMulti: 0 },
    lastActiveAt: Date.now(),
  };
}

function loadState(): GameState {
  const defaults = freshState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as GameState;
    const upgrades = { ...defaults.upgrades, ...parsed.upgrades };
    return {
      ...defaults,
      ...parsed,
      upgrades,
      starUpgrades: { ...defaults.starUpgrades, ...parsed.starUpgrades },
      rocks:
        Array.isArray(parsed.rocks) && parsed.rocks.length > 0
          ? parsed.rocks
          : spawnInitialRocks(upgrades, parsed.zoneIndex ?? 0, ROCKS_ON_SCREEN),
    };
  } catch {
    return defaults;
  }
}

function extractGameState(store: GameStore): GameState {
  return {
    gold: store.gold,
    gems: store.gems,
    stars: store.stars,
    totalGoldEarned: store.totalGoldEarned,
    totalGoldEarnedThisPrestige: store.totalGoldEarnedThisPrestige,
    prestigeCount: store.prestigeCount,
    zoneIndex: store.zoneIndex,
    rocksClearedInZone: store.rocksClearedInZone,
    rocks: store.rocks,
    upgrades: store.upgrades,
    starUpgrades: store.starUpgrades,
    lastActiveAt: Date.now(),
  };
}

interface DamagePatch {
  rocks: Rock[];
  goldGained: number;
  zoneIndex: number;
  rocksClearedInZone: number;
  brokenIds: Set<string>;
}

/** Applies `damageFor(rock)` to every rock, breaking (and respawning) any that run out of HP. */
function applyDamageToRocks(state: GameState, damageFor: (rock: Rock) => number): DamagePatch {
  let goldGained = 0;
  let clearedCount = 0;
  let zoneIndex = state.zoneIndex;
  let rocksClearedInZone = state.rocksClearedInZone;
  const brokenIds = new Set<string>();
  const survivors: Rock[] = [];

  for (const rock of state.rocks) {
    const damage = damageFor(rock);
    if (damage <= 0) {
      survivors.push(rock);
      continue;
    }
    const nextHp = rock.hp - damage;
    if (nextHp > 0) {
      survivors.push({ ...rock, hp: nextHp });
      continue;
    }
    brokenIds.add(rock.id);
    goldGained += goldReward(state.upgrades, state.starUpgrades.goldMulti, rock.baseReward, rock.isGolden);
    clearedCount += 1;
  }

  rocksClearedInZone += clearedCount;
  while (rocksClearedInZone >= ROCKS_PER_ZONE_ADVANCE) {
    rocksClearedInZone -= ROCKS_PER_ZONE_ADVANCE;
    zoneIndex += 1;
  }

  const rocks = survivors;
  for (let i = 0; i < clearedCount; i++) {
    rocks.push(spawnRock(state.upgrades, zoneIndex, rocks));
  }

  return { rocks, goldGained, zoneIndex, rocksClearedInZone, brokenIds };
}

function applyPatch(state: GameState, patch: DamagePatch) {
  return {
    rocks: patch.rocks,
    gold: state.gold + patch.goldGained,
    totalGoldEarned: state.totalGoldEarned + patch.goldGained,
    totalGoldEarnedThisPrestige: state.totalGoldEarnedThisPrestige + patch.goldGained,
    zoneIndex: patch.zoneIndex,
    rocksClearedInZone: patch.rocksClearedInZone,
  };
}

let lastTick = performance.now();

export const useGameStore = create<GameStore>((set, get) => ({
  ...loadState(),

  mineRocks: (ids) => {
    const state = get();
    if (ids.length === 0 || state.rocks.length === 0) return { isCrit: false, hits: [] };

    const idSet = new Set(ids);
    const { damage, isCrit } = resolveTapHit(state.upgrades);
    const patch = applyDamageToRocks(state, (rock) => (idSet.has(rock.id) ? damage : 0));
    set(applyPatch(state, patch));

    const hits: RockHit[] = state.rocks
      .filter((r) => idSet.has(r.id))
      .map((r) => ({ id: r.id, damage, broke: patch.brokenIds.has(r.id) }));
    return { isCrit, hits };
  },

  tick: (now) => {
    const dt = Math.min((now - lastTick) / 1000, 0.25);
    lastTick = now;
    const state = get();
    const dps = droneDps(state.upgrades);
    if (dps <= 0 || state.rocks.length === 0) return;

    const perRockDamage = (dps * dt) / state.rocks.length;
    const patch = applyDamageToRocks(state, () => perRockDamage);
    set(applyPatch(state, patch));
  },

  buyUpgrade: (key) => {
    const state = get();
    const def = UPGRADES.find((u) => u.key === key)!;
    if (!canAfford(state, def)) return false;
    set({
      gold: state.gold - upgradeCost(def, state.upgrades[key]),
      upgrades: { ...state.upgrades, [key]: state.upgrades[key] + 1 },
    });
    return true;
  },

  canPrestige: () => potentialPrestigeStars(get().totalGoldEarnedThisPrestige) > 0,

  doPrestige: () => {
    const state = get();
    const gained = potentialPrestigeStars(state.totalGoldEarnedThisPrestige);
    if (gained <= 0) return 0;
    const upgrades = freshUpgrades();
    set({
      stars: state.stars + gained,
      prestigeCount: state.prestigeCount + 1,
      gold: 0,
      totalGoldEarnedThisPrestige: 0,
      zoneIndex: 0,
      rocksClearedInZone: 0,
      rocks: spawnInitialRocks(upgrades, 0, ROCKS_ON_SCREEN),
      upgrades,
    });
    return gained;
  },

  buyStarUpgrade: () => {
    const state = get();
    const cost = 1 + state.starUpgrades.goldMulti;
    if (state.stars < cost) return false;
    set({
      stars: state.stars - cost,
      starUpgrades: { goldMulti: state.starUpgrades.goldMulti + 1 },
    });
    return true;
  },

  resolveOfflineProgress: () => {
    const state = get();
    const elapsed = Date.now() - state.lastActiveAt;
    if (elapsed < 15_000) return null;
    const cappedMs = Math.min(elapsed, OFFLINE_CAP_MS);
    const dps = droneDps(state.upgrades);
    // Offline simulation is a flat DPS trickle (no golden/crit rolls) at 50% efficiency.
    const gold = dps > 0 ? dps * (cappedMs / 1000) * 0.5 : 0;
    // Stamp lastActiveAt regardless of outcome so a repeat call (e.g. React
    // StrictMode's double effect invocation in dev) can't grant this twice.
    set(
      gold > 0
        ? {
            gold: state.gold + gold,
            totalGoldEarned: state.totalGoldEarned + gold,
            totalGoldEarnedThisPrestige: state.totalGoldEarnedThisPrestige + gold,
            lastActiveAt: Date.now(),
          }
        : { lastActiveAt: Date.now() },
    );
    return gold > 0 ? { elapsedMs: cappedMs, gold } : null;
  },

  save: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extractGameState(get())));
  },

  hardReset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(freshState());
  },
}));
