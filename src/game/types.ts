import type Decimal from "break_eternity.js";

export interface UpgradeLevels {
  pickaxe: number;
  drone: number;
  goldenChance: number;
  goldenMulti: number;
  critChance: number;
  critMulti: number;
  miningRadius: number;
}

export interface Rock {
  id: string;
  /** Position as a percentage (0-100) of the stage's width/height. */
  x: number;
  y: number;
  /** Rendered diameter in pixels. */
  size: number;
  hp: Decimal;
  maxHp: Decimal;
  /** Reward rolled at spawn time, before golden/prestige multipliers. */
  baseReward: Decimal;
  isGolden: boolean;
  color: string;
}

export interface GameState {
  gold: Decimal;
  gems: Decimal;
  stars: Decimal;
  totalGoldEarned: Decimal;
  totalGoldEarnedThisPrestige: Decimal;
  prestigeCount: number;
  zoneIndex: number;
  /** Furthest zone ever reached, persisted; caps how far manual zone navigation can jump. */
  maxZoneReached: number;
  rocksClearedInZone: number;
  rocks: Rock[];
  upgrades: UpgradeLevels;
  starUpgrades: {
    goldMulti: number;
  };
  lastActiveAt: number;
}

export const STORAGE_KEY = "idle-obelisk-poc-save-v4";
