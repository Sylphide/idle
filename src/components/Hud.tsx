import { useGameStore } from "../game/store";
import { formatNumber } from "../game/format";

export function Hud() {
  const gold = useGameStore((s) => s.gold);
  const gems = useGameStore((s) => s.gems);
  const stars = useGameStore((s) => s.stars);

  return (
    <div className="hud">
      <div className="currency">
        <span className="icon">🪙</span>
        <span>{formatNumber(gold)}</span>
      </div>
      <div className="currency">
        <span className="icon">💎</span>
        <span>{formatNumber(gems)}</span>
      </div>
      <div className="currency">
        <span className="icon">⭐</span>
        <span>{formatNumber(stars)}</span>
      </div>
    </div>
  );
}
