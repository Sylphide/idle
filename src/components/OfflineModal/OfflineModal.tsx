import { formatDuration, formatNumber } from "../../game/format";
import type { OfflineResult } from "../../game/store";
import styles from "./OfflineModal.module.css";

export function OfflineModal({ result, onClaim }: { result: OfflineResult | null; onClaim: () => void }) {
  if (!result) return null;
  return (
    <div className={styles.modal}>
      <div className={styles.card}>
        <h2>Welcome back!</h2>
        <p>
          You were away for {formatDuration(result.elapsedMs)} and your drones earned {formatNumber(result.gold)}{" "}
          gold.
        </p>
        <button onClick={onClaim}>Claim</button>
      </div>
    </div>
  );
}
