import { useEffect, useState } from "react";
import { useGameStore, type OfflineResult } from "./game/store";
import { Hud } from "./components/Hud";
import { ZoneBanner } from "./components/ZoneBanner";
import { RockStage } from "./components/RockStage";
import { TabBar, type Tab } from "./components/TabBar";
import { MinePanel } from "./components/MinePanel";
import { UpgradesPanel } from "./components/UpgradesPanel";
import { PrestigePanel } from "./components/PrestigePanel";
import { OfflineModal } from "./components/OfflineModal";

const SAVE_INTERVAL_MS = 10_000;

export function App() {
  const [tab, setTab] = useState<Tab>("mine");
  const [offlineResult, setOfflineResult] = useState<OfflineResult | null>(null);

  useEffect(() => {
    setOfflineResult(useGameStore.getState().resolveOfflineProgress());
  }, []);

  useEffect(() => {
    let raf: number;
    const loop = (now: number) => {
      useGameStore.getState().tick(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const save = () => useGameStore.getState().save();
    const interval = setInterval(save, SAVE_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("beforeunload", save);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", save);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <>
      <Hud />
      <ZoneBanner />
      <RockStage />
      <section className="panel">
        {tab === "mine" && <MinePanel />}
        {tab === "upgrades" && <UpgradesPanel />}
        {tab === "prestige" && <PrestigePanel />}
      </section>
      <TabBar active={tab} onChange={setTab} />
      <OfflineModal result={offlineResult} onClaim={() => setOfflineResult(null)} />
    </>
  );
}
