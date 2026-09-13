import { useGameStore } from "../game/store";
import { zoneFor } from "../game/zones";

export function ZoneBanner() {
  const zoneIndex = useGameStore((s) => s.zoneIndex);
  return <div className="zone-banner">{zoneFor(zoneIndex).name}</div>;
}
