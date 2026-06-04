---
created: 2026-06-04
updated: 2026-06-04
---

# Research: Showcase Apps

## Problem Statement

Replace the flat, single-screen component playground in the demo host (`apps/web`) with three
realistic sample applications — **Console** (admin), **Tracker** (tasks), **Commerce** (shop) —
that together use the *entire* `@ngguide/ui` catalog at least once, are interactive within a
session on mock data, demonstrate runtime theming (light/dark + brand seed), adapt across compact
and expanded viewports, and show empty/loading/error states. The work is greenfield inside
`apps/web`; the published library is not modified by this feature (per the project vision's "no
application concerns in the library" boundary).

This document catalogues solution variants per problem area. It makes **no decisions** — that is
`spec:design`'s job.

## Problem Areas

### 1. Demo host architecture & routing

_Related requirements: 1.1–1.4, 7.3; Superseded (remove flat playground)_

The demo host currently bootstraps a single `AppComponent` with an **empty** route table
(`apps/web/src/app/app.routes.ts:3` → `export const appRoutes: Route[] = []`) and providers for
zoneless CD, router, and M3 theme (`apps/web/src/app/app.config.ts:9-22`). We need a structure for
three apps + per-app sections that are individually addressable (R1.4) and a home for the runtime
theme controls (R7).

#### Variant A: Single shared shell + lazy feature routes per app

**How it works:** A `Shell` layout component (top app bar + navigation + theme controls) wraps
child routes via `<router-outlet>`. Each app is a lazily-loaded routes file (`loadChildren`) whose
sections are standalone components (`loadComponent`). `AppComponent` becomes a thin router host;
`/` redirects to a default app or a small hub. Theme mode + brand seed live as signals in the shell
(one place), so they persist across in-session navigation (R7.3).

**Pros:**
- DRY chrome and a single, consistent theming surface across all three apps.
- Sections are individually addressable/shareable (satisfies R1.4) and code-split per app.
- Idiomatic Angular standalone + `provideRouter` lazy loading.

**Cons:**
- The shared shell must vary its navigation per active app (extra logic to resolve "which app/section is active").
- One relatively large shell component concentrates the chrome.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Builds directly on the existing empty `provideRouter(appRoutes)` wiring (`app.config.ts:12`); no current shell exists to conflict with.
**Evidence:** Lazy `loadComponent`/`loadChildren` on standalone routes [ng-lazy-routes]; current empty routes (`apps/web/src/app/app.routes.ts:3`).

#### Variant B: Three independent route trees + a hub launcher

**How it works:** No shared shell. A hub/landing component at `/` links to three top-level route
trees (`/admin`, `/tasks`, `/shop`), each bringing its own chrome (optionally via a shared,
*composed* layout component rather than a routing wrapper). Theme controls are either duplicated or
hoisted into a shared header used by each tree.

**Pros:**
- Maximum isolation — each app reads end-to-end as a self-contained reference (helps the "эталон" goal).
- No cross-app coupling in routing.

**Cons:**
- Chrome/theming logic duplicated or pushed into a shared component anyway; more boilerplate.
- Keeping theme state consistent across three trees needs a shared service rather than shell-local signals.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Same standalone routing primitives as A; diverges by not centralizing the shell.
**Evidence:** [ng-lazy-routes]; `provideRouter` standalone usage [ng-provide-router].

#### Variant C: No router — signal-driven view switch on one page

**How it works:** Keep the single-page setup; replace the flat content with a segmented/tab switch
backed by a signal that shows one app component at a time. Each app's sections are likewise
toggled by signals.

**Pros:**
- Lowest wiring effort; no routing to configure.
- Keeps the current no-router bootstrap.

**Cons:**
- Sections are **not** individually addressable or shareable — fails R1.4 and R1.2's deep-linking intent.
- Does not demonstrate routing (a core Angular concern), undercutting the "reference" goal.

**Effort:** Low | **Risk:** Medium (conflicts with R1.4)
**Codebase fit:** Matches today's empty-router state but contradicts the addressability requirement.
**Evidence:** R1.4 (`.specs/showcase-apps/requirements.md`); current single-component host (`apps/web/src/app/app.component.ts`).

---

### 2. Navigation chrome & adaptive layout

_Related requirements: 1.1–1.3, 8.1–8.3; Constraint: no published navigation components_

The library has **no** navigation components — confirmed by the `tsconfig.base.json` `paths` map and
`libs/ui` listing (no navigation bar/rail/drawer, top app bar, tabs, toolbar, or search). The vision
lists these as a *future* target catalog (`.projects/ngguide-ui/vision.md` System Boundary). So the
demo must source its app bar / navigation rail / drawer / app-switcher elsewhere, and must adapt
between compact and expanded widths (R8).

#### Variant A: Hand-rolled M3 chrome from primitives + CSS-driven adaptivity

**How it works:** Build the top app bar, navigation rail (expanded) and bottom bar/drawer (compact)
as bespoke components styled entirely from `--md-sys-*` tokens, reusing `icon`, `icon-button`,
`badge`, `list`, `menu`, `divider`. Switch rail ↔ bottom-bar/drawer purely in CSS via container or
media queries (no JS).

**Pros:**
- Zero new dependencies; strict M3 styling straight from tokens; reuses existing primitives (aids coverage).
- CSS-only layout switch is SSR-safe with no hydration shift or flash (no viewport read at runtime).

**Cons:**
- Must implement M3 nav anatomy/measurements/states by hand → risk of subtle deviation from the M3 spec.
- CSS-only adaptive navigation (esp. drawer open/close) can get fiddly.

**Effort:** Medium-High | **Risk:** Medium
**Codebase fit:** Aligns with the "build from primitives" constraint; reuses `list`/`menu`/`icon`. Tailwind v4 (`package.json:56`) + tokens available.
**Evidence:** No nav components (`tsconfig.base.json` paths; `libs/ui` listing); container queries baseline-available with `container-type: inline-size` + `@container` [container-queries]; token families present (`libs/ui/src/styles/theme.css`).

#### Variant B: Hand-rolled chrome + programmatic adaptivity (CDK / GuiBreakpoint)

**How it works:** Same bespoke chrome, but drive the rail↔drawer/bottom-bar switch from a breakpoint
*signal* — either `@angular/cdk/layout` (already a dependency; carousel/dialog use its `MediaMatcher`)
or the library's own `GuiBreakpoint` service exported from `@ngguide/ui/overlay`.

**Pros:**
- Breakpoint state is available in TypeScript (auto-collapse rail, conditionally render the drawer, set aria).
- Reuses an existing dependency / existing library service.

**Cons:**
- Viewport reads are client-only → SSR must pick a deterministic default and reconcile on hydration to avoid a layout shift.
- More moving parts than a pure-CSS switch.

**Effort:** Medium-High | **Risk:** Medium
**Codebase fit:** `@angular/cdk/layout` already used via `MediaMatcher` (`libs/ui/carousel`, `libs/ui/dialog`); `GuiBreakpoint` exists in `@ngguide/ui/overlay`.
**Evidence:** CDK v21.2.13 (`package.json:9`); `cdk/layout` MediaMatcher usage (carousel/dialog specs); `GuiBreakpoint` export (`libs/ui/overlay/src/index.ts`).

#### Variant C: Build real M3 navigation components in the library first

**How it works:** Implement navigation-bar/rail/drawer/top-app-bar (and possibly tabs) as new
`@ngguide/ui/*` entry points (full M3 specs, specs/tests, coverage), then consume them in the demo.

**Pros:**
- Closes the acknowledged gap; the demo becomes fully idiomatic (no bespoke chrome).
- Advances the library's stated target catalog.

**Cons:**
- Large scope expansion — each is a separately spec'd, tested, published component; turns a demo task into a multi-component library program.
- Couples the demo's timeline to new library work; higher overall risk.

**Effort:** High | **Risk:** Medium-High
**Codebase fit:** Matches the vision's future catalog but far exceeds the showcase scope; would itself need its own spec(s).
**Evidence:** Vision lists nav components as future targets (`.projects/ngguide-ui/vision.md`); none exist today (`tsconfig.base.json` paths).

#### Variant D: Minimal navigation from `list` + `menu` only

**How it works:** Keep navigation deliberately light — a `gui-list`-based side menu plus the existing
`menu` component for app switching; on compact widths it collapses to a menu-triggered drawer. No
full M3 rail/bar anatomy.

**Pros:**
- Lowest effort and lowest M3-deviation risk (uses real, already-tested components).
- Strong reuse of `list`/`menu` (coverage).

**Cons:**
- Thinner, less "showcase-grade" chrome; doesn't demonstrate M3 navigation rail/drawer patterns.
- Adaptivity is shallower (collapse/expand a menu rather than morph rail↔bar).

**Effort:** Low-Medium | **Risk:** Low
**Codebase fit:** Pure reuse of `@ngguide/ui/list` and `@ngguide/ui/menu`.
**Evidence:** `list`/`menu` selectors and usage (`apps/web/src/app/app.component.html:535-576, 1003-1042`).

---

### 3. Mock data & in-session functional state

_Related requirements: 3.3–3.6, 4.1–4.6, 5.1–5.6, 6.1–6.4, 9.1–9.4_

Apps must support working search/filter/sort and create/edit/delete that reflect everywhere in the
session and reset on reload (R6), on in-memory data with no backend (R6.4), while staying
SSR-deterministic (no hydration mismatch — the app is server-rendered, `apps/web/project.json`
`outputMode: server`). The library ships no app-state layer (it is components-only), so this is
greenfield.

#### Variant A: Per-app signal stores + computed derived views

**How it works:** Each app has an injectable `*Store` holding `signal<T[]>` collections plus
mutation methods (add/update/remove). Filter/search/sort are separate signals; the visible
collection is a `computed()` derived from data + filters. Seed data is static fixtures (deterministic
— fixed dates via explicit `new Date(year, month, day)` or plain `{y,m,d}` records; stable ids; no
`Date.now()`/`Math.random()`).

**Pros:**
- Matches the kit's signal-first, zoneless direction; reactive filter/sort/search "for free" via `computed`.
- Reset-on-reload is automatic (in-memory store re-seeds at bootstrap → satisfies R6.3).
- SSR-deterministic as long as fixtures are static.

**Cons:**
- Requires discipline on determinism (dates/ids) to avoid hydration drift.
- Decision needed on store lifetime: app-root singleton vs route-scoped provider.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Zoneless + signals throughout (`app.config.ts:11`); no existing app services to conflict with (greenfield).
**Evidence:** Zoneless CD (`apps/web/src/app/app.config.ts:11`); SSR output mode (`apps/web/project.json` build options); determinism rule (`CLAUDE.md`, project vision).

#### Variant B: RxJS `BehaviorSubject` stores + async pipe

**How it works:** Classic reactive stores: `BehaviorSubject<T[]>` for data, RxJS operators
(`map`/`combineLatest`) for derived filtered streams, consumed via `async` pipe.

**Pros:**
- Familiar reactive pattern; operators handle search debounce / combination cleanly.

**Cons:**
- Diverges from the kit's signal-first house style; more subscription/async-pipe boilerplate.
- Mixing streams with signal components is workable but adds conceptual overhead.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Works under zoneless, but stylistically off-pattern vs the signal-based library.
**Evidence:** Library components use signals (e.g. `libs/ui/list/src/list.ts`); RxJS is transitively available via Angular.

#### Variant C: Signal stores mirrored to `localStorage` (persistence)

**How it works:** Variant A plus a sync that mirrors state to `localStorage` so it survives reload.

**Pros:**
- More "real"; would satisfy a persistence goal.

**Cons:**
- **Conflicts with R6.3** (the chosen requirement is reset-on-reload, not persistence).
- `localStorage` is client-only → SSR must guard reads; rehydrating persisted state risks a first-paint flash/mismatch.

**Effort:** Medium | **Risk:** Medium (conflicts with a stated requirement)
**Codebase fit:** Same store shape as A; adds a browser-only persistence concern that complicates SSR.
**Evidence:** R6.3 (`.specs/showcase-apps/requirements.md`); SSR determinism constraints (project vision).

**Sub-decision — task status change (R4.2):** the board's "change status" can be implemented with
`@angular/cdk/drag-drop` (already a dependency; used by `libs/ui/bottom-sheet`) for drag-between-columns,
or with a status control/menu (no drag). This is orthogonal to the store choice; see Open Questions.

---

### 4. Dashboard visualizations from primitives

_Related requirements: 3.2, 10.x; Constraint: no third-party charting product_

The Console dashboard must present trends/metrics visually without a chart library (none is installed;
constraint forbids adding one).

#### Variant A: Hand-built inline SVG (sparklines / bars / rings)

**How it works:** Compute geometry from data and render `<svg>` polylines/rects/arcs colored with
`--md-sys-*` tokens (e.g. `var(--md-sys-color-primary)`).

**Pros:**
- Full expressive range (line sparklines, bar series, donut); crisp at any size; no dependency.
- SSR-safe when data is static.

**Cons:**
- Geometry computed by hand; needs explicit a11y labels/roles for the SVG.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** No chart lib (`package.json`); colors from tokens (`libs/ui/src/styles/tokens/_color.generated.css`).
**Evidence:** No charting dependency (`package.json`); token color families (`libs/ui/src/styles/theme.css`).

#### Variant B: Primitives-only (progress components + CSS bars)

**How it works:** Express metrics with `gui-linear-progress` / `gui-circular-progress` for ratios and
CSS flex bars sized by percentage; KPIs as cards.

**Pros:**
- Maximal reuse of library primitives (helps R2 coverage — progress components get a real home); trivial; fully token-driven.

**Cons:**
- Limited to bars/rings; cannot show a continuous trend/sparkline.
- Progress semantics ("loading") may not perfectly model a static metric.

**Effort:** Low | **Risk:** Low
**Codebase fit:** Reuses `@ngguide/ui/progress`; supports the coverage requirement.
**Evidence:** `progress` exports `GuiLinearProgress`/`GuiCircularProgress` (`libs/ui/progress/src/index.ts`); usage example (`apps/web/src/app/app.component.html:824-856`).

#### Variant C: Hybrid — KPI cards + progress for ratios + small inline-SVG sparklines for trends

**How it works:** Combine B (KPI cards, progress rings/bars for ratios) with small inline-SVG
sparklines (from A) only where a trend line is needed.

**Pros:**
- Covers both ratio and trend visuals; still reuses progress primitives for coverage; bounded SVG surface.

**Cons:**
- Two visualization techniques to maintain.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Combines existing `progress` reuse with minimal bespoke SVG.
**Evidence:** As A and B above.

---

### 5. Iconography

_Related requirements: 2.x (polish/idiomatic), cross-cuts every screen_

`gui-icon` is a content-projection primitive only — it renders `<ng-content>` and sizes via
`--gui-comp-icon-size` (`libs/ui/icon/src/icon.ts`). No icon set ships with the library, and the
current playground uses emoji/unicode glyphs. A showcase-grade look needs a real icon source.

#### Variant A: Material Symbols font (Google Fonts), ligature names

**How it works:** Load the Material Symbols Outlined font and render icons by writing their snake_case
name as text inside `gui-icon`, with the Material-Symbols font applied via a class (e.g.
`<gui-icon class="sym">dashboard</gui-icon>`).

**Pros:**
- Material Symbols *is* the M3 icon system — large, consistent, on-spec set with variable axes (fill/weight/grade/optical-size).
- Trivial authoring via ligatures; the demo already loads a Google Font (Roboto), so the pattern exists.

**Cons:**
- External font request → potential flash of unstyled/again text (mitigate with `display`/`swap` and a fallback); ligature text shows raw if the font fails.
- Overlay-rendered icons (dialog/sheet/menu render in a CDK overlay **outside** the app subtree) must be reached by a **class** rule, not an ancestor selector.

**Effort:** Low | **Risk:** Low-Medium
**Codebase fit:** `gui-icon` projects content (`libs/ui/icon/src/icon.ts`); `styles.css` already `@import`s a Google Font (`apps/web/src/styles.css:1`).
**Evidence:** Material Symbols is a Google-Fonts ligature font (`.material-symbols-outlined`, `font-family: 'Material Symbols Outlined'`) with four variable axes [material-symbols]; icon projection (`libs/ui/icon/src/icon.ts`).

#### Variant B: Bundled inline-SVG icon set

**How it works:** Curate a fixed set of SVG path icons (from an open set) inlined into `gui-icon` (as
small components or templates), colored via `currentColor` + tokens.

**Pros:**
- No network/font dependency; SSR-safe with no flash; works uniformly inside overlays.
- Full control over exactly which icons ship.

**Cons:**
- Must curate and maintain the set; verbose SVG markup; more upfront effort for many distinct icons.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** No icon lib present (`package.json`); pairs with `gui-icon` projection.
**Evidence:** No icon dependency (`package.json`); `gui-icon` projection (`libs/ui/icon/src/icon.ts`).

#### Variant C: Keep emoji / unicode glyphs

**How it works:** Continue the current approach — emoji/text glyphs inside `gui-icon`.

**Pros:**
- Zero work; SSR-safe; no external assets.

**Cons:**
- Inconsistent rendering across platforms; not M3; undercuts the showcase-grade goal.

**Effort:** Low | **Risk:** Low effort, High quality risk
**Codebase fit:** Matches the current kitchen-sink usage.
**Evidence:** Emoji glyph usage throughout `apps/web/src/app/app.component.html` (e.g. `★`, `☆`, `✉`).

---

### 6. Component coverage assurance

_Related requirements: 2.1, 2.4_

Every published entry point (34 found via `tsconfig.base.json` paths) must appear ≥1 across the three
apps, and coverage must be verifiable (R2.4).

#### Variant A: Coverage manifest + manual checklist (review / test-plan)

**How it works:** Maintain a table mapping each entry point → the app/screen where it's used; verify
by review and as part of `spec:test-plan`. (A first version of this manifest already exists from this
research pass.)

**Pros:**
- Simple, transparent, no test infrastructure; reuses the existing spec/test-plan flow.

**Cons:**
- Manual; can drift if an app changes after the checklist is written; not CI-enforced.

**Effort:** Low | **Risk:** Medium (drift)
**Codebase fit:** Matches existing `.specs/*/test-plan.md` practice.
**Evidence:** Existing test-plan workflow (`.specs/containment/test-plan.md`); 34 entry points (`tsconfig.base.json`).

#### Variant B: Automated coverage test in CI

**How it works:** A spec that renders the apps (or scans their templates) and asserts each component
selector / usage is present, failing the build if any entry point is missing.

**Pros:**
- Enforced; cannot silently drift; objective pass/fail.

**Cons:**
- Brittle (selector scanning) and heavy (rendering all apps); service-driven components (dialog, snackbar, bottom-sheet, side-sheet) aren't present as static template selectors, so coverage detection is non-trivial for them.

**Effort:** Medium-High | **Risk:** Medium
**Codebase fit:** `web` has a `test` target on native Vitest (`apps/web/project.json`); the ≥1-spec rule already requires a spec there.
**Evidence:** Web test target + ≥1-spec rule (`apps/web/project.json`; `CLAUDE.md`).

#### Variant C: Coverage-by-construction via an in-context "gallery" section

**How it works:** Add a curated gallery section that intentionally renders every component used in a
realistic grouping, guaranteeing coverage by design and doubling as the visual reference.

**Pros:**
- Coverage guaranteed by construction; serves the "витрина" reference goal directly.

**Cons:**
- Risks re-creating the flat playground that Superseded Behaviors removes, unless strictly framed as in-context examples rather than an isolated dump.

**Effort:** Low-Medium | **Risk:** Medium (tension with the "remove flat demo" intent)
**Codebase fit:** Conceptually close to the removed kitchen-sink; must be framed to avoid reintroducing it.
**Evidence:** Superseded Behaviors (`.specs/showcase-apps/requirements.md`).

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. Host architecture & routing | A. Shared shell + lazy routes | M | L | Builds on empty `provideRouter` |
| 1. Host architecture & routing | B. Independent trees + hub | M | L | Standalone routing, less centralized |
| 1. Host architecture & routing | C. No router, signal switch | L | M | Matches today but fails R1.4 |
| 2. Nav chrome & adaptivity | A. Hand-rolled + CSS adaptivity | M-H | M | Primitives + tokens + Tailwind |
| 2. Nav chrome & adaptivity | B. Hand-rolled + CDK/GuiBreakpoint | M-H | M | cdk/layout & GuiBreakpoint exist |
| 2. Nav chrome & adaptivity | C. Build M3 nav components first | H | M-H | Vision target, large scope |
| 2. Nav chrome & adaptivity | D. Minimal list+menu nav | L-M | L | Pure reuse of list/menu |
| 3. Mock data & state | A. Signal stores + computed | M | L | Signal-first, zoneless |
| 3. Mock data & state | B. RxJS BehaviorSubject | M | L | Off-pattern vs signals |
| 3. Mock data & state | C. Signals + localStorage | M | M | Conflicts with R6.3 |
| 4. Dashboard visualizations | A. Inline SVG | M | L | No chart lib; tokens |
| 4. Dashboard visualizations | B. Primitives-only (progress/CSS) | L | L | Reuses progress (coverage) |
| 4. Dashboard visualizations | C. Hybrid KPI + progress + SVG | M | L | Combines reuse + minimal SVG |
| 5. Iconography | A. Material Symbols font | L | L-M | gui-icon projection; font already loaded |
| 5. Iconography | B. Bundled inline SVG | M | L | No icon lib |
| 5. Iconography | C. Emoji/unicode glyphs | L | L (quality H) | Current approach |
| 6. Coverage assurance | A. Manifest + manual checklist | L | M | Existing test-plan flow |
| 6. Coverage assurance | B. Automated CI coverage test | M-H | M | web has test target |
| 6. Coverage assurance | C. In-context gallery section | L-M | M | Near the removed kitchen-sink |

## Cross-area dependencies

- **Area 1 ↔ Area 2:** A shared shell (1-A) is the natural host for hand-rolled chrome (2-A/2-B) and the single theme-control surface (R7.3). The no-router option (1-C) forfeits R1.4 *and* makes per-section addressing impossible regardless of nav choice.
- **Area 2-C feeds the library, not just the demo:** building real navigation components is a library program with its own spec/tests/coverage — it changes the *scope* of this feature, not only its design.
- **Area 5-A ↔ Containment overlays:** Material Symbols scoping must use a **class** rule (not an ancestor selector) because dialog/side-sheet/menu icons render in a CDK overlay outside the app subtree.
- **Area 3-C conflicts with R6.3:** persistence contradicts the chosen reset-on-reload requirement; pick it only if the requirement changes.

## Codebase Insights

- **34 secondary entry points** exist (authoritative list: `tsconfig.base.json` `paths`, lines ~17-54), grouped as actions / selection / text-inputs / communication / containment / theme / interaction / overlay / forms / icon / root. A full selector+input manifest was produced during this research and should seed the coverage checklist.
- **No navigation components** ship (no nav bar/rail/drawer, top app bar, tabs, toolbar, search) — the single biggest gap for a "real app" demo.
- **`@angular/cdk` v21.2.13** is present (`package.json:9`); already-used subpackages: `menu`, `overlay`, `portal`, `dialog`, `a11y`, `layout` (`MediaMatcher`), `drag-drop`. `BreakpointObserver`/`CdkTable`/virtual-scroll are available but currently unused.
- **`@ngguide/ui/overlay` exports `GuiBreakpoint`** (`isCompact()`-style API) — a library-native option for adaptivity.
- **Theme is SSR-safe and runtime-mutable:** `M3ThemeService.setTheme({ mode })` sets `color-scheme` + `light-dark()` and updates a single managed `<style data-m3-dynamic>` adopted on hydration; `[data-contrast]` is used, there is **no** `[data-theme]` attribute (`libs/ui/theme/src/{theme.service,css-builder,style-applier}.ts`).
- **The app is server-rendered** (`apps/web/project.json` `outputMode: server`, `ssr.entry` server.ts), not prerendered → module/render-time `Date.now()`/`Math.random()`/argless `new Date()` are hydration-mismatch risks; mock fixtures must be deterministic.
- **`gui-icon` is projection-only**, sized by `--gui-comp-icon-size` (`libs/ui/icon/src/icon.ts`); no bundled icon set.
- **Tailwind v4.1.7 + full M3 token families** (color, typescale, shape, elevation, state) are wired in `apps/web/src/styles.css` and `libs/ui/src/styles/theme.css`.
- **Test rule:** `web` discovers specs by glob (`src/**/*.spec.ts`); the native runner has no `passWithNoTests`, so the project must retain ≥1 spec (removing `app.component.spec.ts` requires a replacement spec).
- **`apps/web/src/app/app.component.html`** is a working usage reference for ~30 components (correct selectors, inputs, two-way bindings) and should be mined when rebuilding.

## Sources

- [material-symbols] https://developers.google.com/fonts/docs/material_symbols — fetched 2026-06-04
- [container-queries] https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries — fetched 2026-06-04
- [ng-lazy-routes] https://angular.dev/guide/routing/loading-strategies — fetched 2026-06-04 (context7: /websites/angular_dev)
- [ng-provide-router] https://angular.dev/api/router/provideRouter — fetched 2026-06-04 (context7: /websites/angular_dev)

## Open Questions

- [ ] **Board status change (R4.2):** drag-and-drop via `@angular/cdk/drag-drop` (available, used by bottom-sheet) vs a status control/menu — decide in design; drag adds polish but more interaction/SSR-state handling.
- [ ] **Commerce product imagery (R5.3):** deterministic placeholder imagery (inline SVG / CSS gradients, SSR-safe) vs external image URLs (network dependency, possible non-determinism) — needs a design decision.
- [ ] **Store lifetime:** app-root singleton stores vs route-scoped providers (affects reset semantics and memory).
- [ ] **Default landing:** does `/` redirect to one app or present a hub/launcher (affects Area 1 choice)?
- [ ] **Coverage of service-driven components** (dialog/snackbar/bottom-sheet/side-sheet) in any automated coverage check — these have no static selector, so manual/manifest verification may be unavoidable.

## Next Steps

`spec:design showcase-apps` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research showcase-apps` again — it will extend
this catalogue rather than overwrite it.
