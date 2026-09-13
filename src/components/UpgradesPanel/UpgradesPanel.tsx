import { useGameStore } from "../../game/store";
import { UPGRADES, upgradeCost, canAfford } from "../../game/upgrades";
import { formatNumber } from "../../game/format";
import { UpgradeCard } from "../UpgradeCard/UpgradeCard";
import styles from "./UpgradesPanel.module.css";

export function UpgradesPanel() {
  const state = useGameStore((s) => s);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  return (
    <div className={styles.list}>
      {UPGRADES.map((def) => {
        const level = state.upgrades[def.key];
        const cost = upgradeCost(def, level);
        return (
          <UpgradeCard
            key={def.key}
            name={def.name}
            level={level}
            description={def.description}
            effect={def.effectLabel(level)}
            costLabel={`🪙 ${formatNumber(cost)}`}
            affordable={canAfford(state, def)}
            onBuy={() => buyUpgrade(def.key)}
          />
        );
      })}
    </div>
  );
}
