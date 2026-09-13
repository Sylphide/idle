import type { UpgradeLevels } from "./types";

export function tapDamage(upgrades: UpgradeLevels): number {
  return 1 + upgrades.pickaxe * 1.5;
}

export function droneDps(upgrades: UpgradeLevels): number {
  return upgrades.drone * 1.2;
}

export function goldenChance(upgrades: UpgradeLevels): number {
  return Math.min(upgrades.goldenChance * 0.015, 0.6);
}

export function goldenMultiplier(upgrades: UpgradeLevels): number {
  return 2 + upgrades.goldenMulti * 0.25;
}

export function critChance(upgrades: UpgradeLevels): number {
  return Math.min(upgrades.critChance * 0.012, 0.5);
}

export function critMultiplier(upgrades: UpgradeLevels): number {
  return 2 + upgrades.critMulti * 0.3;
}

export function miningRadius(upgrades: UpgradeLevels): number {
  return 55 + upgrades.miningRadius * 11;
}

export function prestigeGoldMultiplier(starGoldMultiLevel: number): number {
  return 1 + starGoldMultiLevel * 0.02;
}

export function resolveTapHit(upgrades: UpgradeLevels): { damage: number; isCrit: boolean } {
  const isCrit = Math.random() < critChance(upgrades);
  const damage = tapDamage(upgrades) * (isCrit ? critMultiplier(upgrades) : 1);
  return { damage, isCrit };
}

export function goldReward(
  upgrades: UpgradeLevels,
  starGoldMultiLevel: number,
  baseReward: number,
  isGolden: boolean,
): number {
  const multi = (isGolden ? goldenMultiplier(upgrades) : 1) * prestigeGoldMultiplier(starGoldMultiLevel);
  return baseReward * multi;
}

export function potentialPrestigeStars(totalGoldEarnedThisPrestige: number): number {
  const divisor = 5000;
  return Math.floor(Math.sqrt(totalGoldEarnedThisPrestige / divisor));
}
