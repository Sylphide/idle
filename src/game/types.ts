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
  hp: number;
  maxHp: number;
  /** Reward rolled at spawn time, before golden/prestige multipliers. */
  baseReward: number;
  isGolden: boolean;
  color: string;
}

export interface GameState {
  gold: number;
  gems: number;
  stars: number;
  totalGoldEarned: number;
  totalGoldEarnedThisPrestige: number;
  prestigeCount: number;
  zoneIndex: number;
  rocksClearedInZone: number;
  rocks: Rock[];
  upgrades: UpgradeLevels;
  starUpgrades: {
    goldMulti: number;
  };
  lastActiveAt: number;
}

export const STORAGE_KEY = "idle-obelisk-poc-save-v2";
