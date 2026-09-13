export type Tab = "mine" | "upgrades" | "prestige";

const TABS: { key: Tab; label: string }[] = [
  { key: "mine", label: "Mine" },
  { key: "upgrades", label: "Upgrades" },
  { key: "prestige", label: "Prestige" },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab${active === tab.key ? " active" : ""}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
