import { useGameStore } from "../game/store";
import { UPGRADES, upgradeCost, canAfford } from "../game/upgrades";
import { formatNumber } from "../game/format";

export function UpgradesPanel() {
  const state = useGameStore((s) => s);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <div className="upgrade-list">
      {UPGRADES.map((def) => {
        const level = state.upgrades[def.key];
        const cost = upgradeCost(def, level);
        const affordable = canAfford(state, def);
        return (
          <div className="upgrade-card" key={def.key}>
            <div className="upgrade-info">
              <div className="upgrade-name">
                {def.name} <span className="upgrade-level">Lv.{level}</span>
              </div>
              <div className="upgrade-desc">{def.description}</div>
              <div className="upgrade-effect">{def.effectLabel(level)}</div>
            </div>
            <button className="buy-btn" disabled={!affordable} onClick={() => buyUpgrade(def.key)}>
              🪙 {formatNumber(cost)}
            </button>
          </div>
        );
      })}
    </div>
  );
}
