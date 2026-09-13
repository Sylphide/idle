import { cx } from "../../lib/cx";
import styles from "./TabBar.module.css";

export type Tab = "mine" | "upgrades" | "prestige";

const TABS: { key: Tab; label: string }[] = [
  { key: "mine", label: "Mine" },
  { key: "upgrades", label: "Upgrades" },
  { key: "prestige", label: "Prestige" },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className={styles.tabs}>
      {TABS.map((tab) => (
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
