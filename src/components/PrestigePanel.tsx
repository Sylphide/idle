import { useGameStore } from "../game/store";
import { potentialPrestigeStars } from "../game/formulas";
import { formatNumber } from "../game/format";

export function PrestigePanel() {
  const totalGoldEarnedThisPrestige = useGameStore((s) => s.totalGoldEarnedThisPrestige);
  const stars = useGameStore((s) => s.stars);
  const goldMultiLevel = useGameStore((s) => s.starUpgrades.goldMulti);
  const doPrestige = useGameStore((s) => s.doPrestige);
  const buyStarUpgrade = useGameStore((s) => s.buyStarUpgrade);

  const gain = potentialPrestigeStars(totalGoldEarnedThisPrestige);
  const canPrestige = gain > 0;
  const upgradeCost = 1 + goldMultiLevel;

  return (
    <div className="prestige-panel">
      <p>
        Reset your progress on this run to earn <strong>{formatNumber(gain)} ⭐</strong>.
      </p>
      <p className="hint">Stars are permanent and boost all future gold gains.</p>
      <button
        className="prestige-btn"
        disabled={!canPrestige}
        onClick={() => {
          if (!canPrestige) return;
          const gained = doPrestige();
          alert(`Prestiged! Gained ${formatNumber(gained)} stars.`);
        }}
      >
        Reset for {formatNumber(gain)} ⭐
      </button>

      <h3 className="shop-title">Star Shop</h3>
      <div className="upgrade-card">
        <div className="upgrade-info">
          <div className="upgrade-name">
            Gold Multiplier <span className="upgrade-level">Lv.{goldMultiLevel}</span>
          </div>
          <div className="upgrade-desc">Permanently increases all gold earned.</div>
          <div className="upgrade-effect">+{(goldMultiLevel * 2).toFixed(0)}% gold</div>
        </div>
        <button className="buy-btn" disabled={stars < upgradeCost} onClick={() => buyStarUpgrade()}>
          ⭐ {upgradeCost}
        </button>
      </div>
    </div>
  );
}
