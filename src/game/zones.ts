import Decimal from "break_eternity.js";

export interface OreType {
  name: string;
  color: string;
  baseHp: Decimal;
  baseReward: Decimal;
}

// Ordered by rarity/depth. Purely original naming/flavor, not taken from any existing game.
export const ORE_TYPES: OreType[] = [
  { name: "Tin", color: "#8d7b68", baseHp: new Decimal(20), baseReward: new Decimal(4) },
  { name: "Copper", color: "#b56a3a", baseHp: new Decimal(45), baseReward: new Decimal(9) },
  { name: "Iron", color: "#8a8f98", baseHp: new Decimal(110), baseReward: new Decimal(22) },
  { name: "Silver", color: "#c7cdd6", baseHp: new Decimal(260), baseReward: new Decimal(55) },
  { name: "Gold", color: "#e0b93d", baseHp: new Decimal(620), baseReward: new Decimal(135) },
  { name: "Platinum", color: "#a9d1d6", baseHp: new Decimal(1500), baseReward: new Decimal(330) },
  { name: "Mythril", color: "#5ad1c9", baseHp: new Decimal(3600), baseReward: new Decimal(800) },
  { name: "Adamant", color: "#7a5ad1", baseHp: new Decimal(8800), baseReward: new Decimal(1950) },
  { name: "Void Crystal", color: "#4a2f7a", baseHp: new Decimal(21000), baseReward: new Decimal(4700) },
  { name: "Star Core", color: "#ffd76a", baseHp: new Decimal(52000), baseReward: new Decimal(11500) },
];

// A zone sits between two consecutive ore types and mixes them in a fixed
// proportion. Progressing zones walks this share down from 100% (pure
// lower-tier ore) to 20%, then the next zone starts the next pair back at
// 100% (pure higher-tier ore) — e.g. 100% Tin, 80/20 Tin-Copper, 50/50,
// 20/80, 100% Copper, 80/20 Copper-Iron, ...
const MIX_STEPS = [1, 0.8, 0.5, 0.2];

export interface ZoneMix {
  name: string;
  primary: OreType;
  secondary: OreType;
  /** Fraction (0-1) of rocks in this zone that spawn as the primary ore. */
  primaryShare: number;
}

const TRANSITIONS = ORE_TYPES.length - 1;
export const ZONES_PER_LOOP = TRANSITIONS * MIX_STEPS.length;

function scaleOre(ore: OreType, scale: Decimal): OreType {
  return scale.eq(1) ? ore : { ...ore, baseHp: ore.baseHp.times(scale), baseReward: ore.baseReward.times(scale) };
}

export function zoneFor(zoneIndex: number): ZoneMix {
  const wrapped = zoneIndex % ZONES_PER_LOOP;
  const loop = Math.floor(zoneIndex / ZONES_PER_LOOP);
  // Decimal (not Math.pow) since `loop` grows unboundedly over a long enough run.
  const scale = new Decimal(3.2).pow(loop);

  const pairIndex = Math.floor(wrapped / MIX_STEPS.length);
  const primaryShare = MIX_STEPS[wrapped % MIX_STEPS.length];

  const primary = scaleOre(ORE_TYPES[pairIndex], scale);
  const secondary = scaleOre(ORE_TYPES[pairIndex + 1], scale);
  const name = primaryShare >= 1 ? primary.name : `${primary.name} / ${secondary.name}`;

  return { name, primary, secondary, primaryShare };
}

/** How many rocks must be broken before a zone advances. Grows (slowly) with depth. */
export function rocksToClearZone(zoneIndex: number): number {
  return Math.round(6 + Math.sqrt(Math.max(zoneIndex, 0)) * 2.5);
}
