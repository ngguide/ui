# Angular UI Kit by [ng.guide](https://ng.guide/ui-kit?utm_source=github&utm_medium=readme&utm_campaign=ui-kit)

UI Kit is a modern, modular UI component library for Angular — built **from scratch**, guided by the course [ng.guide](https://ng.guide/ui-kit?utm_source=github&utm_medium=readme&utm_campaign=ui-kit).
This is not a wrapper around Angular Material — it's a fresh implementation of Material Design principles with full transparency, customizability, and learning in mind.

## 🚧 Work in Progress

UI Kit is being built **in public**, component by component, as part of the Angular UI Kit course. The goal is to provide both a reusable component set **and** an educational reference for building high-quality Angular libraries.

> Want to learn and contribute?
> Join the course or jump into issues and PRs — everyone's welcome.

---

## 🌐 Live Docs

Browse the live documentation at **[ui.ng.guide](https://ui.ng.guide)**. Every component ships with interactive live examples **and** their source code, served from a custom Angular documentation site (no Storybook involved).

---

## 📦 Features

- ♻️ **Reusable Angular components** — standalone, signal-based, zoneless-ready
- 🧱 **Material Design-inspired, not dependent on Angular Material**
- 📦 **ng-packagr & APF-compatible** publishable package (`@ngguide/ui`)
- 🎨 **Customizable themes & tokens** powered by an M3 theming layer
- 🧪 **Tested with Vitest** (Angular's first-party Vitest builder)
- 🧩 **Per-component entry points** — import only what you use

---

## Components

29 components ship today, each as its own secondary entry point under `@ngguide/ui/*`. All of the components below are available now:

| Category      | Component           | Import path                    |
| ------------- | ------------------- | ------------------------------ |
| Actions       | Buttons             | `@ngguide/ui/button`           |
| Actions       | FAB / Extended FAB  | `@ngguide/ui/fab`              |
| Actions       | FAB menu            | `@ngguide/ui/fab-menu`         |
| Actions       | Icon buttons        | `@ngguide/ui/icon-button`      |
| Actions       | Button groups       | `@ngguide/ui/button-group`     |
| Actions       | Segmented buttons   | `@ngguide/ui/segmented-button` |
| Actions       | Split button        | `@ngguide/ui/split-button`     |
| Communication | Badges              | `@ngguide/ui/badge`            |
| Communication | Progress indicators | `@ngguide/ui/progress`         |
| Communication | Loading indicator   | `@ngguide/ui/loading-indicator`|
| Communication | Snackbar            | `@ngguide/ui/snackbar`         |
| Communication | Tooltips            | `@ngguide/ui/tooltip`          |
| Containment   | Cards               | `@ngguide/ui/card`             |
| Containment   | Carousel            | `@ngguide/ui/carousel`         |
| Containment   | Dialogs             | `@ngguide/ui/dialog`           |
| Containment   | Divider             | `@ngguide/ui/divider`          |
| Containment   | Lists               | `@ngguide/ui/list`             |
| Containment   | Bottom sheets       | `@ngguide/ui/bottom-sheet`     |
| Containment   | Side sheets         | `@ngguide/ui/side-sheet`       |
| Selection     | Checkbox            | `@ngguide/ui/checkbox`         |
| Selection     | Radio button        | `@ngguide/ui/radio`            |
| Selection     | Switch              | `@ngguide/ui/switch`           |
| Selection     | Chips               | `@ngguide/ui/chip`             |
| Selection     | Sliders             | `@ngguide/ui/slider`           |
| Selection     | Menus               | `@ngguide/ui/menu`             |
| Text inputs   | Text fields         | `@ngguide/ui/text-field`       |
| Text inputs   | Date pickers        | `@ngguide/ui/date-picker`      |
| Text inputs   | Time pickers        | `@ngguide/ui/time-picker`      |
| Foundations   | Icon                | `@ngguide/ui/icon`             |

Under the hood, components are built on a set of low-level **building blocks** that ship as their own entry points but are not user-facing components on their own:

- `@ngguide/ui/theme` — `provideM3Theme`, `M3ThemeService`, `generateScheme` (M3 design-token/theming infrastructure)
- `@ngguide/ui/interaction` — `[guiStateLayer]`, `[guiRipple]`, `[guiFocusRing]` and a11y key managers
- `@ngguide/ui/overlay` — picker/modal/breakpoint overlay infrastructure
- `@ngguide/ui/forms` — `[guiFormControl]` ControlValueAccessor bridge for forms integration
- `@ngguide/ui/datetime` — date models, parsing, and Intl helpers used by the date/time pickers
- `@ngguide/ui` (base) — shared primitives and types (e.g. the `GuiSize` union)

### Planned

These are genuine Material 3 components not yet built. They have no entry point today and are tracked for future modules:

- App bars
- Toolbars
- Navigation bar
- Navigation rail
- Navigation drawer
- Tabs
- Search

---

## 🧭 Course Roadmap (Aligned with the Course)

| Module | Focus                               | Status     |
| ------ | ----------------------------------- | ---------- |
| 1      | Intro to UI Kits and Design Systems | ✅ Done    |
| 2      | Project Setup and Structure         | ✅ Done    |
| 3      | Component Architecture              | 🚧 Ongoing |
| 4      | Styling & Style Isolation           | ⏳ Planned |
| 5      | Icon System                         | ⏳ Planned |
| 6      | Theming with Design Tokens          | ⏳ Planned |
| 7      | Accessibility (a11y)                | ⏳ Planned |
| 8      | Testing                             | ⏳ Planned |
| 9      | Documentation                       | ⏳ Planned |
| 10     | Build & Publish                     | ⏳ Planned |
| 11–12  | Tooling: Schematics & ng add/update | ⏳ Bonus   |

---

## 🛠 Tech Stack

- **Angular 21** (standalone components, `ChangeDetectionStrategy.OnPush`)
- **Signals-based** state and inputs
- **Zoneless** change detection (no `zone.js`)
- **Nx 22** monorepo, **pnpm** package manager
- **ng-packagr** (APF-compatible) for the publishable library, via the `@nx/angular:package` executor
- **Vitest** (Angular's first-party Vitest builder, jsdom, zoneless) for testing
- **Custom Angular docs site** hosted at [ui.ng.guide](https://ui.ng.guide) for live examples + code
- Hand-authored CSS driven by **M3 design tokens** (no CSS framework / utility classes for component styling)

---

## 🧑‍💻 Contributing

UI Kit is **community-first**. If you're following the course or just want to contribute:

1. Clone the repo
2. Run `pnpm install`
3. Use the Nx targets via `pnpm exec`:
   ```bash
   pnpm exec nx serve web                         # run the demo / docs playground
   pnpm exec nx test ui                           # test the library
   pnpm exec nx build ui                          # build the publishable @ngguide/ui package
   pnpm exec nx run-many -t lint test build       # everything, both projects
   ```
4. Check open issues or suggest improvements

> Every component is developed **with public feedback** — PRs, suggestions, and code reviews are encouraged.

To scaffold a new component (each is a secondary entry point of the single `ui` library):

```bash
pnpm exec nx g @nx/angular:library-secondary-entry-point --library=ui --name=<component-name> --skipModule
```

---

## 📚 Learn as You Build

This library is the backbone of the course **Angular UI Kit** on [ng.guide](https://ng.guide/ui-kit?utm_source=github&utm_medium=readme&utm_campaign=ui-kit) — where you learn to build your own UI system, not just use one.

---

## 📜 License

MIT — use freely, contribute openly.
