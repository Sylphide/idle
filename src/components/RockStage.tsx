import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useGameStore } from "../game/store";
import { miningRadius } from "../game/formulas";

const PULSE_INTERVAL_MS = 150;

interface Floater {
  id: string;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
  isGolden: boolean;
}

export function RockStage() {
  const rocks = useGameStore((s) => s.rocks);
  const upgrades = useGameStore((s) => s.upgrades);
  const radius = miningRadius(upgrades);

  const stageRef = useRef<HTMLDivElement>(null);
  const lastClientPos = useRef<{ x: number; y: number } | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [pointerPx, setPointerPx] = useState<{ x: number; y: number } | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [breakingIds, setBreakingIds] = useState<Set<string>>(new Set());

  const pulseAtClient = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    setPointerPx({ x: px, y: py });

    const targets = useGameStore
      .getState()
      .rocks.map((r) => ({ rock: r, cx: (r.x / 100) * rect.width, cy: (r.y / 100) * rect.height }))
      // Circle-circle overlap: hits if the mining circle touches the rock's own body, not just its exact center.
      .filter((t) => Math.hypot(t.cx - px, t.cy - py) <= radius + t.rock.size / 2);
    if (targets.length === 0) return;

    const { isCrit, hits } = useGameStore.getState().mineRocks(targets.map((t) => t.rock.id));

    const newFloaters: Floater[] = [];
    const brokenNow = new Set<string>();
    for (const hit of hits) {
      const target = targets.find((t) => t.rock.id === hit.id);
      if (!target) continue;
      newFloaters.push({
        id: `${hit.id}-${Date.now()}-${Math.random()}`,
        x: target.cx,
        y: target.cy,
        text: `-${Math.ceil(hit.damage)}`,
        isCrit,
        isGolden: target.rock.isGolden,
      });
      if (hit.broke) brokenNow.add(hit.id);
    }
    setFloaters((prev) => [...prev, ...newFloaters]);
    if (brokenNow.size > 0) {
      setBreakingIds((prev) => new Set([...prev, ...brokenNow]));
      window.setTimeout(() => {
        setBreakingIds((prev) => {
          const next = new Set(prev);
          for (const id of brokenNow) next.delete(id);
          return next;
        });
      }, 220);
    }
  };

  const startMining = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastClientPos.current = { x: e.clientX, y: e.clientY };
    pulseAtClient(e.clientX, e.clientY);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (lastClientPos.current) pulseAtClient(lastClientPos.current.x, lastClientPos.current.y);
    }, PULSE_INTERVAL_MS);
  };

  const moveMining = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (intervalRef.current === null) return;
    lastClientPos.current = { x: e.clientX, y: e.clientY };
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) setPointerPx({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const stopMining = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastClientPos.current = null;
    setPointerPx(null);
  };

  return (
    <main
      ref={stageRef}
      className="stage"
      aria-label="Mining area: press and hold to mine rocks in a radius"
      onPointerDown={startMining}
      onPointerMove={moveMining}
      onPointerUp={stopMining}
      onPointerCancel={stopMining}
      onPointerLeave={stopMining}
      onContextMenu={(e) => e.preventDefault()}
    >
      {rocks.map((rock) => (
        <div
          key={rock.id}
          className={`rock-item${rock.isGolden ? " golden" : ""}${breakingIds.has(rock.id) ? " breaking" : ""}`}
          style={
            {
              left: `${rock.x}%`,
              top: `${rock.y}%`,
              width: rock.size,
              height: rock.size,
              "--rock-color": rock.color,
            } as CSSProperties
          }
        >
          <div className="rock-hp-bar">
            <div className="rock-hp-fill" style={{ width: `${(rock.hp / rock.maxHp) * 100}%` }} />
          </div>
        </div>
      ))}

      {pointerPx && (
        <div
          className="mine-radius"
          style={{ left: pointerPx.x, top: pointerPx.y, width: radius * 2, height: radius * 2 }}
        />
      )}

      <div className="floaters">
        {floaters.map((f) => (
          <span
            key={f.id}
            className={`floater${f.isCrit ? " crit" : ""}${f.isGolden ? " golden" : ""}`}
            style={{ left: f.x, top: f.y }}
            onAnimationEnd={() => setFloaters((prev) => prev.filter((x) => x.id !== f.id))}
          >
            {f.text}
          </span>
        ))}
      </div>
    </main>
  );
}
