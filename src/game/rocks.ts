import { zoneFor } from "./zones";
import { goldenChance } from "./formulas";
import type { Rock, UpgradeLevels } from "./types";

export const ROCKS_ON_SCREEN = 6;

/** Picks a spot in the stage, biased away from already-placed rocks. */
function randomPosition(existing: Rock[]): { x: number; y: number } {
  let best = { x: 50, y: 50 };
  let bestMinDist = -1;
  for (let i = 0; i < 8; i++) {
    const candidate = { x: 12 + Math.random() * 76, y: 15 + Math.random() * 70 };
    const minDist = existing.reduce(
      (min, r) => Math.min(min, Math.hypot(r.x - candidate.x, r.y - candidate.y)),
      Infinity,
    );
    if (minDist > bestMinDist) {
      bestMinDist = minDist;
      best = candidate;
    }
  }
  return best;
}

export function spawnRock(upgrades: UpgradeLevels, zoneIndex: number, existing: Rock[]): Rock {
  const zone = zoneFor(zoneIndex);
  const ore = Math.random() < zone.primaryShare ? zone.primary : zone.secondary;
  const variance = 0.85 + Math.random() * 0.3;
  const { x, y } = randomPosition(existing);
  const hp = ore.baseHp.times(variance);
  return {
    id: `rock-${Math.random().toString(36).slice(2, 9)}`,
    x,
    y,
    size: 56 + Math.random() * 28,
    hp,
    maxHp: hp,
    baseReward: ore.baseReward.times(variance),
    isGolden: Math.random() < goldenChance(upgrades),
    color: ore.color,
  };
}

export function spawnInitialRocks(upgrades: UpgradeLevels, zoneIndex: number, count: number): Rock[] {
  const rocks: Rock[] = [];
  for (let i = 0; i < count; i++) rocks.push(spawnRock(upgrades, zoneIndex, rocks));
  return rocks;
}
