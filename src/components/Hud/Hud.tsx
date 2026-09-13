import { useGameStore } from "../../game/store";
import { formatNumber } from "../../game/format";
import styles from "./Hud.module.css";

export function Hud() {
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const stars = useGameStore((s) => s.stars);

  return (
    <div className={styles.hud}>
      <div className={styles.currency}>
        <span>🪙</span>
        <span>{formatNumber(gold)}</span>
      </div>
      <div className={styles.currency}>
        <span>💎</span>
        <span>{formatNumber(gems)}</span>
      </div>
      <div className={styles.currency}>
        <span>⭐</span>
        <span>{formatNumber(stars)}</span>
      </div>
    </div>
  );
}
