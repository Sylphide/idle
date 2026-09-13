import type { ReactNode } from "react";
import styles from "./UpgradeCard.module.css";

export function UpgradeCard({
  name,
  level,
  description,
  effect,
  costLabel,
  affordable,
  onBuy,
}: {
  name: string;
  level: number;
  description: string;
  effect: string;
  costLabel: ReactNode;
  affordable: boolean;
  onBuy: () => void;
}) {
  return (
    <div className={styles.card}>
      <div>
        <div className={styles.name}>
          {name} <span className={styles.level}>Lv.{level}</span>
        </div>
        <div className={styles.desc}>{description}</div>
        <div className={styles.effect}>{effect}</div>
      </div>
      <button className={styles.buyBtn} disabled={!affordable} onClick={onBuy}>
        {costLabel}
      </button>
    </div>
  );
}
