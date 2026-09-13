import type { GameState, UpgradeLevels } from "./types";

export type UpgradeKey = keyof UpgradeLevels;

export interface UpgradeDef {
  key: UpgradeKey;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  effectLabel: (level: number) => string;
}

export const UPGRADES: UpgradeDef[] = [
  {
    key: "pickaxe",
    name: "Pickaxe",
    description: "Increases the damage dealt while mining.",
    baseCost: 10,
    costGrowth: 1.14,
    effectLabel: (lvl) => `Tap damage x${(1 + lvl * 0.15).toFixed(2)}`,
  },
  {
    key: "drone",
    name: "Mining Drone",
    description: "Automatically damages nearby rocks over time.",
    baseCost: 25,
    costGrowth: 1.16,
    effectLabel: (lvl) => `+${(lvl * 1.2).toFixed(1)} DPS`,
  },
  {
    key: "goldenChance",
    name: "Prospector's Eye",
    description: "Increases the chance a rock spawns as a Golden Rock.",
    baseCost: 60,
    costGrowth: 1.22,
    effectLabel: (lvl) => `${Math.min(lvl * 1.5, 60).toFixed(1)}% golden chance`,
  },
  {
    key: "goldenMulti",
    name: "Golden Refinery",
    description: "Increases gold earned from Golden Rocks.",
    baseCost: 80,
    costGrowth: 1.22,
    effectLabel: (lvl) => `Golden reward x${(2 + lvl * 0.25).toFixed(2)}`,
  },
  {
    key: "critChance",
    name: "Lucky Strike",
    description: "Chance for a tap to deal a critical hit.",
    baseCost: 50,
    costGrowth: 1.2,
    effectLabel: (lvl) => `${Math.min(lvl * 1.2, 50).toFixed(1)}% crit chance`,
  },
  {
    key: "critMulti",
    name: "Heavy Swing",
    description: "Increases critical hit damage.",
    baseCost: 70,
    costGrowth: 1.2,
    effectLabel: (lvl) => `Crit damage x${(2 + lvl * 0.3).toFixed(2)}`,
  },
  {
    key: "miningRadius",
    name: "Wide Pickaxe",
    description: "Increases the radius of your mining area, hitting more rocks at once.",
    baseCost: 40,
    costGrowth: 1.25,
    effectLabel: (lvl) => `Mining radius: ${Math.round(55 + lvl * 11)}px`,
  },
];

export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.ceil(def.baseCost * Math.pow(def.costGrowth, level));
}

export function canAfford(state: GameState, def: UpgradeDef): boolean {
  return state.gold >= upgradeCost(def, state.upgrades[def.key]);
}
