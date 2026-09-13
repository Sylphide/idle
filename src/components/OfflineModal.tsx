import { formatDuration, formatNumber } from "../game/format";
import type { OfflineResult } from "../game/store";

export function OfflineModal({ result, onClaim }: { result: OfflineResult | null; onClaim: () => void }) {
  if (!result) return null;
  return (
    <div className="modal">
      <div className="modal-card">
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
