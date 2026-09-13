# Idle Miner POC

Proof of concept for an idle/incremental mining game, built with web tech
(Vite + TypeScript, no framework) and packaged for mobile with
[Capacitor](https://capacitorjs.com/).

## Origin & methodology

This POC is **inspired by** the mobile game *Idle Obelisk Miner*
(`com.checkbox.minershminer`, GameMaker Studio / YoYo Games engine), whose
decompiled Android build lives in `../output`.

That build's Java/Kotlin sources are only the Android runner and SDK glue
(Play Services, AppsFlyer, Sentry, billing, etc.) — the actual gameplay is
compiled GML bytecode inside `assets/game.droid`, and the project uses the
**YYC** (YoYo Compiler) backend, meaning scripts are compiled straight into
native code. There is no decompilable game logic to read or copy.

What *was* extracted (using
[UndertaleModTool](https://github.com/UnderminersTeam/UndertaleModTool)'s
CLI against `game.droid`) is structural **metadata only**: the list of
game object names, sprite names, room/layer layout, sound/font names, and
all 12k+ UI/config strings. No code, art, audio, or text content was
copied — that metadata was used purely to understand the shape of the
original game (its systems, currencies, and progression vocabulary), and
everything in this POC (mechanics balancing, names, art, copy) was written
from scratch.

Systems identified this way, for reference / future roadmap:

- Core loop: tap/auto-damage rocks with a pickaxe, break them for
  ore/gold, golden & critical hit variants, active "bomb" abilities.
- Auto-miner drones with their own leveling.
- Prestige ("Obelisk" reset) for a permanent star currency.
- Zone/tier progression (named ore tiers, escalating difficulty).
- Large meta-game layer: pets, fishing, archaeology, an "arcanist" skill
  tree, raids, statues, weather events, quests/tasks, lootbugs,
  leaderboards/achievements (Play Games), cloud save, and a sizeable IAP
  shop.

## Scope of this POC

Only the **core loop** is implemented so far — everything else above is
a possible v2+ direction, not started:

- Several rocks scattered randomly across the mining area at once (not a
  single central rock). Press and hold anywhere to mine continuously —
  the pickaxe hits everything inside a circular radius around the
  pointer/finger, not just whatever's directly under it.
- Gold currency, golden-rock and critical-hit variants
- Zone progression (10 original ore-tier names, looping with scaling;
  the zone advances as rocks are cleared, independent of any single rock)
- Auto-damage via drones, whose DPS is split evenly across all rocks
  currently on screen
- An upgrade shop (pickaxe damage, drones, mining radius, golden
  chance/multiplier, crit chance/multiplier)
- Prestige into a Star currency with a small permanent-multiplier shop
- Offline progress (capped, claimed via a modal on return)
- Local save (`localStorage`, autosave + save on background/close)

No IAP, ads, accounts, cloud save, or native SDKs are wired up — this is
a client-only loop meant to validate the mechanics and the Capacitor
packaging path.

## Tech stack

- **Vite + TypeScript + React**, with **Zustand** for game state. The
  store (`src/game/store.ts`) owns the whole `GameState` (including the
  list of rocks currently on screen) plus its actions (mine, tick, buy
  upgrade, prestige, offline resolution, save/load); React components
  subscribe to just the slices they render via selectors.
  `localStorage` writes stay on an explicit `save()` call (autosave every
  10s + on background/close) rather than on every state change, since the
  drone tick loop updates the store up to 60×/s.
- Mining is **press-and-hold**, not click-per-hit: `RockStage.tsx` tracks
  the pointer position via Pointer Events (mouse + touch alike) and fires
  a damage pulse every 150ms at that position for as long as the pointer
  stays down, hitting every rock whose body overlaps the pickaxe's radius
  circle (circle-circle collision, not just an exact point match).
- **Capacitor** wraps the built web app for native shells. The `android/`
  native project is already generated and committed; `ios/` can be added
  later from macOS with `npx cap add ios` (needs Xcode, unavailable in
  this Linux environment).

## Project structure

```
src/
  game/
    types.ts      Game state shape (incl. the Rock type)
    zones.ts       Ore-tier/zone definitions
    rocks.ts       Rock spawning: random placement, per-rock stats
    upgrades.ts    Upgrade definitions & cost curve
    formulas.ts    Derived stats (damage, DPS, radius, chances, multipliers)
    store.ts       Zustand store: state + actions (mine, tick, buy, prestige, save/load)
    format.ts      Number/duration formatting
  components/
    Hud.tsx, ZoneBanner.tsx, RockStage.tsx (pointer-driven mining), TabBar.tsx,
    MinePanel.tsx, UpgradesPanel.tsx, PrestigePanel.tsx, OfflineModal.tsx
  App.tsx          Ties components together, drives the RAF tick loop & autosave
  main.tsx
  style.css
android/            Capacitor native Android project
capacitor.config.ts
```

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build         # type-check + production build to dist/
npm run cap:sync      # build + copy web assets into native projects
npm run cap:android   # build, sync, then open the project in Android Studio
```

Opening/building the Android project requires Android Studio / the
Android SDK, which isn't installed in this environment — `android/` is
generated and ready to open on a machine that has it.
