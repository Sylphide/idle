export interface Zone {
  name: string;
  color: string;
  baseHp: number;
  baseReward: number;
}

// Each zone scales HP and reward exponentially over the previous one.
// Purely original naming/flavor, not taken from any existing game.
export const ZONES: Zone[] = [
  { name: "Flintstone Cave", color: "#8d7b68", baseHp: 20, baseReward: 4 },
  { name: "Copper Vein", color: "#b56a3a", baseHp: 45, baseReward: 9 },
  { name: "Iron Hollow", color: "#8a8f98", baseHp: 110, baseReward: 22 },
  { name: "Silver Grotto", color: "#c7cdd6", baseHp: 260, baseReward: 55 },
  { name: "Gold Chamber", color: "#e0b93d", baseHp: 620, baseReward: 135 },
  { name: "Platinum Depths", color: "#a9d1d6", baseHp: 1500, baseReward: 330 },
  { name: "Mythril Tunnels", color: "#5ad1c9", baseHp: 3600, baseReward: 800 },
  { name: "Adamant Rift", color: "#7a5ad1", baseHp: 8800, baseReward: 1950 },
  { name: "Void Crystal Abyss", color: "#4a2f7a", baseHp: 21000, baseReward: 4700 },
  { name: "Star Core", color: "#ffd76a", baseHp: 52000, baseReward: 11500 },
];

export function zoneFor(index: number): Zone {
  const wrapped = index % ZONES.length;
  const loop = Math.floor(index / ZONES.length);
  const scale = Math.pow(3.2, loop);
  const z = ZONES[wrapped];
  return {
    ...z,
    baseHp: z.baseHp * scale,
    baseReward: z.baseReward * scale,
  };
}
