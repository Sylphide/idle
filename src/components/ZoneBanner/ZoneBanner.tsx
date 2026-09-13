import { useGameStore } from "../../game/store";
import { zoneFor, rocksToClearZone } from "../../game/zones";
import styles from "./ZoneBanner.module.css";

export function ZoneBanner() {
  const zoneIndex = useGameStore((s) => s.zoneIndex);
  const maxZoneReached = useGameStore((s) => s.maxZoneReached);
  const rocksClearedInZone = useGameStore((s) => s.rocksClearedInZone);
  const goToZone = useGameStore((s) => s.goToZone);

  const zone = zoneFor(zoneIndex);
  const threshold = rocksToClearZone(zoneIndex);

  return (
    <div className={styles.banner}>
      <div className={styles.row}>
        <button
          className={styles.nav}
          disabled={zoneIndex <= 0}
          onClick={() => goToZone(zoneIndex - 1)}
          aria-label="Previous zone"
        >
          ‹
        </button>
        <span className={styles.name}>
          {zone.name}
          {zone.primaryShare < 1 && (
            <span className={styles.mix}>
              {" "}
              ({Math.round(zone.primaryShare * 100)}% / {Math.round((1 - zone.primaryShare) * 100)}%)
            </span>
          )}
        </span>
        <button
          className={styles.nav}
          disabled={zoneIndex >= maxZoneReached}
          onClick={() => goToZone(zoneIndex + 1)}
          aria-label="Next zone"
        >
          ›
        </button>
      </div>
      <div className={styles.progress}>
        {rocksClearedInZone} / {threshold} cleared
      </div>
    </div>
  );
}
