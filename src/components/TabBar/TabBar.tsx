import type { ReactNode } from "react";
import { cx } from "../../lib/cx";
import styles from "./TabBar.module.css";
import { MinePanel } from "../MinePanel";
import { UpgradesPanel } from "../UpgradesPanel/UpgradesPanel";
import { PrestigePanel } from "../PrestigePanel/PrestigePanel";

export enum Tab {
  MINE = 'MINE',
  UPGRADES = 'UPGRADES',
  PRESTIGE = 'PRESTIGE',
}
export interface TabConfig {
  key: Tab,
  label: string;
  component: ReactNode
}

export const TABS: Record<Tab, TabConfig> = {
  [Tab.MINE]: { key: Tab.MINE, label: "Mine", component: <MinePanel /> },
  [Tab.UPGRADES]: { key: Tab.UPGRADES, label: "Upgrades", component: <UpgradesPanel /> },
  [Tab.PRESTIGE]: { key: Tab.PRESTIGE, label: "Prestige", component: <PrestigePanel /> },
}

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className={styles.tabs}>
      {Object.values(TABS).map((tab) => (
        <button
          key={tab.key}
          className={cx(styles.tab, active === tab.key && styles.active)}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
