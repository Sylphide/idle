import { useGameStore } from "../../game/store";
import { potentialPrestigeStars } from "../../game/formulas";
import { formatNumber } from "../../game/format";
import { UpgradeCard } from "../UpgradeCard/UpgradeCard";
import styles from "./PrestigePanel.module.css";

export function PrestigePanel() {
  const totalGoldEarnedThisPrestige = useGameStore((s) => s.totalGoldEarnedThisPrestige);
  const stars = useGameStore((s) => s.stars);
  const goldMultiLevel = useGameStore((s) => s.starUpgrades.goldMulti);
  const doPrestige = useGameStore((s) => s.doPrestige);
  const buyStarUpgrade = useGameStore((s) => s.buyStarUpgrade);

  const gain = potentialPrestigeStars(totalGoldEarnedThisPrestige);
  const canPrestige = gain.gt(0);
  const starCost = 1 + goldMultiLevel;

  return (
    <div className={styles.panel}>
      <p>
        Reset your progress on this run to earn <strong>{formatNumber(gain)} ⭐</strong>.
      </p>
      <p className="hint">Stars are permanent and boost all future gold gains.</p>
      <button
        className={styles.prestigeBtn}
        disabled={!canPrestige}
        onClick={() => {
          if (!canPrestige) return;
          const gained = doPrestige();
          alert(`Prestiged! Gained ${formatNumber(gained)} stars.`);
        }}
      >
        Reset for {formatNumber(gain)} ⭐
      </button>

      <h3 className={styles.shopTitle}>Star Shop</h3>
      <UpgradeCard
        name="Gold Multiplier"
        level={goldMultiLevel}
        description="Permanently increases all gold earned."
        effect={`+${(goldMultiLevel * 2).toFixed(0)}% gold`}
        costLabel={`⭐ ${starCost}`}
        affordable={stars.gte(starCost)}
        onBuy={() => buyStarUpgrade()}
      />
    </div>
  );
}
