---
created: 2026-06-01
updated: 2026-06-01
---

# Research: M3 Interaction Foundation

## Problem Statement

`@ngguide/ui` needs a shared interaction layer that every component reuses:
Material Design 3 **state layers** (hover/focus/pressed/dragged overlays),
the **pressed ripple** animation, a **focus indicator**, plus generic a11y
utilities (focus management and roving tabindex). Today there is **no such
layer** — the existing `button`/`fab` components change `background-color`
directly on `:hover`/`:focus-visible`/`:active` via `color-mix()`, draw focus
with a plain `outline`, and have no overlay or ripple at all
(`libs/ui/button/src/button.css`). The `--md-sys-state-*` opacity tokens are
defined but unused (`libs/ui/src/styles/tokens/_state.css`). This spec must
deliver the primitives so components stop re-implementing interaction behavior.

The implementation must obey the project's hard constraints: strict M3 fidelity,
Angular 21 (standalone, signals, **zoneless**, SSR/hydration-safe), a single
publishable library with secondary entry points, and "built from scratch, not a
wrapper around Angular Material" (`CLAUDE.md`, `vision.md`).

A significant constraint discovered during research: **neither `@angular/aria`
nor `@angular/cdk` is currently installed** (verified: `node_modules/@angular/`
contains neither). The vision assumes `@angular/aria` headless primitives, but
adopting them is itself a decision with real tradeoffs (see Problem Area 4).

## Problem Areas

### 1. State-layer rendering

_Related requirements: 1.1–1.9, 4.1_

How the semi-transparent state overlay is drawn on an interactive host. M3
defines the overlay as the host's content color at a per-state opacity, layered
between background and content, not affecting layout.

#### Variant A: CSS pseudo-element driven by native pseudo-classes

**How it works:** A directive marks the host (adds a class/attribute and ensures
`position: relative` + a stacking context). A `::before` (or `::after`)
pseudo-element is the overlay; CSS sets its `background-color` to
`currentColor`/the on-color role and its `opacity` from `--md-sys-state-*`,
switched purely by `:host(:hover)`, `:host(:focus-visible)`, `:host(:active)`.
Almost no JS.

**Pros:**
- Minimal JS; no per-event change detection — naturally zoneless/SSR-safe (overlay is pure CSS).
- Opacities come straight from the existing token contract.
- Cheap, no listeners, no animation handles to clean up.

**Cons:**
- `:active` only loosely models the M3 "pressed" state and cannot express the "dragged" state (no native pseudo-class) — Req 1.5 needs JS or a data-attr anyway.
- Combining states per M3 (Req 1.8, e.g. focus while hovering) is awkward in pure CSS — overlapping pseudo-classes stack opacities unless carefully ordered.
- The directive's CSS must be delivered to the consumer (shipping CSS from a directive is less direct than a component `styleUrl`).

**Effort:** Low | **Risk:** Low
**Codebase fit:** Closest to the current CSS-token approach in `button.css` (which already uses `:focus-visible`/`:hover`/`:active`), but introduces the missing `::before` overlay the repo has nowhere today.
**Evidence:** `[button-css]` current pseudo-class usage; `[state-tokens]` opacity tokens; `[m3-states]` overlay concept + opacities.

#### Variant B: Injected overlay element with JS-tracked state

**How it works:** The directive injects a dedicated child element (e.g.
`<span class="gui-state-layer">`) via `Renderer2` inside `afterNextRender`
(browser-only). Pointer/focus/drag listeners set a `data-state` (or signal) and
the overlay's opacity is computed from the active state, letting the directive
combine states and express dragged explicitly.

**Pros:**
- Full control over all four states incl. dragged (Req 1.5) and combined-state rules (Req 1.8).
- Single source of truth for "current interaction state" — reusable by ripple and focus logic.
- Overlay element is isolated from host content/stacking.

**Cons:**
- More JS: listeners + cleanup; must be zoneless-correct and SSR-gated (`afterNextRender`).
- Injecting a child into arbitrary hosts (e.g. `<button>`) can interfere with `<ng-content>`/text; needs care.
- Heavier than pure CSS for the common hover/focus case.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Matches the SSR-safe DOM pattern already used in `libs/ui/theme/src/style-applier.ts` (`RendererFactory2` + adopt-on-hydration); introduces the repo's first directive with listeners.
**Evidence:** `[after-next-render]` browser-only render hook; `[style-applier]` existing renderer pattern; `[m3-states]`.

#### Variant C: Host-background `color-mix` (extend current approach)

**How it works:** No separate overlay layer. Keep the current pattern —
`color-mix()` between the host background role and the on-color role at the
state opacity — but refactor it to read `--md-sys-state-*` tokens instead of the
hard-coded `8%`/`10%` literals, exposed as a shared CSS class/mixin.

**Pros:**
- Zero new DOM; smallest change from today; trivially SSR/zoneless-safe.
- Reuses the exact mechanism already shipping in `button.css`/`fab.css`.

**Cons:**
- **Diverges from the M3 model** of a discrete translucent state *layer* over the content — it tints the *background only*, so it cannot tint icon/text content or sit above arbitrary surfaces (Req 1.7 "overlay covering the interactive area").
- No clean basis for the pressed ripple to sit "above the state layer" (Req 2.3) — there is no layer.
- Dragged state and combined-state semantics still unsolved.

**Effort:** Low | **Risk:** Medium (fidelity risk)
**Codebase fit:** Literally the current `button.css` pattern, generalized.
**Evidence:** `[button-css]`; `[m3-states]` (state layer is an overlay, not a background tint).

---

### 2. Ripple (pressed-state animation)

_Related requirements: 2.1–2.7, 5.1_

How the expanding pressed ripple is animated. M3: a translucent circle fades in
from the contact point (centered for keyboard), radiates to cover the host, then
fades out — layered above the state layer.

#### Variant A: Web Animations API (`Element.animate()`)

**How it works:** On activation, the directive (inside browser-only code)
creates a ripple element positioned at the pointer coordinates (or host center
for keyboard) and drives a `transform: scale()` + `opacity` keyframe set with
`Element.animate()`, removing the element on `animation.finished`. Reduced-motion
is honored by skipping/short-circuiting the animation (Problem Area 5).

**Pros:**
- `Element.animate()` is Baseline Widely Available (since 2020); returns an `Animation` handle for clean cancel/finish/cleanup (Req 2.6, 2.7).
- Keyframes live in JS next to the geometry math (origin, radius) — natural for pointer-origin ripples.
- No global CSS keyframes to ship.

**Cons:**
- Pure DOM API → must be browser-gated (`afterNextRender`/event handlers only run client-side); not available during SSR.
- WAAP does **not** auto-respect `prefers-reduced-motion` — must gate manually (Req 5.1).
- Most JS of the three ripple variants.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Consistent with renderer/`afterNextRender` DOM creation; no existing ripple to extend.
**Evidence:** `[waap]` baseline + Animation handle + no auto reduced-motion; `[after-next-render]`; `[reduced-motion]`.

#### Variant B: CSS keyframes + JS-set custom properties

**How it works:** Ripple element uses a CSS `@keyframes` animation; the
directive only sets custom properties for origin (`--gui-ripple-x/y`) and toggles
a class to start the animation, listening to `animationend` for cleanup.
Reduced-motion handled by a `@media (prefers-reduced-motion: reduce)` rule that
disables the keyframes (CSS-native).

**Pros:**
- Reduced-motion can be handled entirely in CSS (`@media` query) — no JS branch.
- Less imperative animation code; browser owns the timeline.
- Animation definition is declarative/inspectable in CSS.

**Cons:**
- Coordinating multiple rapid ripples (Req 2.6) via class toggling is fiddlier than independent `Animation` handles.
- Still needs JS for origin coordinates and element lifecycle; still browser-gated for the element injection.
- Shipping global/animation CSS from a directive entry point.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Pairs naturally with state-layer Variant A (CSS-centric); introduces keyframes the repo doesn't have.
**Evidence:** `[reduced-motion]` `@media` query; `[m3-ripple]` origin-at-contact.

#### Variant C: Reuse `@angular/material` `MatRipple`

**How it works:** Depend on `@angular/material` and apply `MatRipple` /
`matRipple` to hosts (it exposes `fadeInRipple(x, y, config)` with enter/leave
phases).

**Pros:**
- Mature, tested ripple with origin/centered/radius config out of the box.
- Offloads animation + cleanup edge cases.

**Cons:**
- **Directly conflicts with the project non-goal** "Not a wrapper around Angular Material / built from scratch" (`vision.md`, `CLAUDE.md`).
- Pulls `@angular/material` (+ transitive `@angular/cdk`) into a kit that publishes a single from-scratch package — large dependency for one primitive.
- Ripple styling/tokens are Material's, not necessarily 1:1 with this kit's `--md-sys-state-*` contract.

**Effort:** Low (wiring) | **Risk:** High (violates a stated non-goal)
**Codebase fit:** Contradicts the "from scratch" architectural decision; no CDK-level ripple exists (ripple is only in `@angular/material`).
**Evidence:** `[cdk-a11y]` (no CDK ripple; ripple is in material); `[mat-ripple]`; `[vision]` non-goal.

---

### 3. Focus-visibility detection

_Related requirements: 3.1–3.5, 4.3_

How to show the focus ring only for keyboard focus (not pointer), including the
programmatic-focus case.

#### Variant A: Native CSS `:focus-visible` only

**How it works:** Style the focus indicator with `:host(:focus-visible)` (the
repo's current approach for `outline`), letting the UA heuristic decide.

**Pros:**
- Zero JS; Baseline Widely Available (since 2022); already used in `button.css`.
- Trivially zoneless/SSR-safe.

**Cons:**
- **Known gap:** browsers typically do **not** show `:focus-visible` for *programmatic* focus on buttons — so components that move focus in code (menus, roving tabindex) may not get a ring (Req 3.1). `element.focus({ focusVisible: true })` can force it but its cross-browser baseline is unverified.

**Effort:** Low | **Risk:** Medium (programmatic-focus gap)
**Codebase fit:** Exactly the current `:focus-visible` outline pattern in `button.css`/`fab.css`.
**Evidence:** `[focus-visible]` baseline + programmatic-focus gap + `focusVisible` option caveat.

#### Variant B: `@angular/cdk/a11y` `FocusMonitor`

**How it works:** Use CDK `FocusMonitor` (or `cdkMonitorElementFocus`) which
reports the `FocusOrigin` (`'keyboard' | 'mouse' | 'touch' | 'program'`); the
directive applies a focus-ring class only for keyboard (and, if desired,
program-after-keyboard).

**Pros:**
- Closes the programmatic-focus gap explicitly (Req 3.1) — origin is known.
- Battle-tested; integrates with roving-tabindex managers from the same package (see Area 4B).

**Cons:**
- Adds `@angular/cdk` as a dependency (not currently installed).
- More moving parts than a CSS pseudo-class for the common case.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** New dependency; aligns with Area 4 variants that also adopt CDK/aria.
**Evidence:** `[cdk-a11y]` FocusMonitor reports origin; `[focus-visible]` (gap that motivates it).

#### Variant C: From-scratch focus-origin tracker

**How it works:** A small zoneless service with global `pointerdown`/`keydown`
listeners tracks the last input modality; the directive shows the ring when the
last interaction was keyboard. Honors programmatic focus by treating
focus-after-keydown as keyboard.

**Pros:**
- No external dependency; full control; tiny.
- Solves the programmatic-focus gap without CDK.

**Cons:**
- Re-implements a well-trodden utility (maintenance burden, edge cases CDK already handles: touch, blur, window-focus).
- Global listeners need careful zoneless + SSR gating and teardown.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Matches "from scratch" ethos; no existing equivalent in repo.
**Evidence:** `[focus-visible]`; `[after-next-render]` (browser-gating listeners).

---

### 4. a11y utilities & ARIA foundation

_Related requirements: 6.1–6.5_

What to build on for focus management + roving tabindex. This is the most
consequential fork because the supporting package is **not installed today**,
and the choice propagates to every component spec (4–9). The requirements scope
this spec to *generic* utilities only — pattern wiring (listbox/menu/tabs/
combobox) stays in component specs (Req 6.5).

#### Variant A: Adopt `@angular/aria` (headless ARIA patterns)

**How it works:** Add `@angular/aria` (v21.2.x). It provides headless,
accessible directives for 8 WAI-ARIA patterns (Listbox, Menu, Tabs, Combobox,
Toolbar, Tree, Grid, Accordion…). This foundation re-exports/wraps the *generic*
pieces (and possibly the focus/roving behaviors it builds on); component specs
layer M3 styling over the patterns.

**Pros:**
- First-party, matches the vision's explicit intent ("behavior on `@angular/aria` headless primitives").
- Patterns (listbox/menu/tabs/combobox) come ready — big leverage for specs 4–9.
- Maintained on the Angular release train.

**Cons:**
- **Developer Preview** as of v21 — API may shift before stable; risk for a foundational dependency.
- Pulls `@angular/cdk@21.2.13` transitively (peer); two new deps.
- Provides *patterns*, but this spec only needs *generic* utilities (Req 6) — much of Aria's surface belongs to component specs, so adopting it here may pull pattern concerns earlier than the boundary allows.

**Effort:** Medium | **Risk:** Medium (Developer Preview churn)
**Codebase fit:** Matches the documented architectural decision; new dependency; transitively adds CDK (enabling Area 3B).
**Evidence:** `[ng-aria-overview]` patterns + headless concept; `[ng-aria-npm]` version, Developer Preview, CDK peer.

#### Variant B: Adopt `@angular/cdk/a11y` only (no Aria yet)

**How it works:** Add only `@angular/cdk`. Use `ListKeyManager`/`FocusKeyManager`
(roving tabindex), `FocusMonitor` (focus origin), and `FocusTrap` as the generic
a11y building blocks; expose thin M3-flavored wrappers. Component specs build
their ARIA patterns on these managers (or adopt `@angular/aria` later).

**Pros:**
- Exactly matches Req 6's *generic* scope — `FocusKeyManager`/`ListKeyManager` *are* the roving-tabindex engine (Req 6.2, 6.3); `FocusMonitor` covers Area 3.
- Stable (not Developer Preview); smaller surface than Aria.
- One dependency; defers the Aria-stability bet to component specs.

**Cons:**
- Not the literal "`@angular/aria`" named in the vision — a deviation to record.
- Component specs must wire ARIA roles/patterns themselves (no ready listbox/menu) — though that is already this spec's boundary.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** New dependency; provides FocusMonitor that Area 3B also wants; defers pattern wrappers to component specs (honors Req 6.5 boundary).
**Evidence:** `[cdk-a11y]` ListKeyManager/FocusKeyManager/FocusMonitor/FocusTrap definitions + stability.

#### Variant C: Build focus management + roving tabindex from scratch

**How it works:** Implement a small focus-management utility (move focus to
first/last/next/previous of a set) and a roving-tabindex helper (single tab stop,
arrow-key movement) with zero external dependencies, as signals/services.

**Pros:**
- No new dependency; full control; aligns with "from scratch" ethos.
- Surface is exactly Req 6 and nothing more.

**Cons:**
- Re-implements well-tested CDK utilities; must cover APG edge cases (wrap-around, type-ahead, horizontal/vertical orientation, RTL, disabled-skip) ourselves.
- Higher long-term maintenance; risk of subtle a11y bugs CDK already solved.
- Component specs (4–9) inherit a bespoke API instead of a documented standard.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Matches the "from scratch" decision; most code to own; no existing helper to extend.
**Evidence:** `[cdk-a11y]` (the standard being re-implemented); `[apg]` patterns to satisfy — _needs investigation_ for exact APG edge-case list.

---

### 5. Directive packaging, composition & reactivity

_Related requirements: 4.4, 4.5, 5.2–5.4, 7.1–7.6_

How the primitives are exposed and how disabled/reduced-motion reactivity is
wired, so components compose them onto their own hosts (Req 7.2) under zoneless
+ SSR.

#### Variant A: Three separate directives + `hostDirectives` composition

**How it works:** Ship `[guiStateLayer]`, `[guiRipple]`, `[guiFocusRing]` as
independent attribute directives. Components compose the ones they need via the
`hostDirectives` API on their `@Component`. Reduced-motion is a shared injectable
signal (built on `matchMedia(...).matches` + `change`); disabled is a signal
input read by each directive.

**Pros:**
- Granular — a component takes only what it needs (e.g. focus ring without ripple).
- `hostDirectives` is the idiomatic Angular 21 way to apply directives to a component host while keeping one public selector (Req 7.2).
- Each directive independently testable.

**Cons:**
- Three coordination points share state (current interaction state, disabled, reduced-motion) — risk of duplicated listeners unless they share a service.
- `hostDirectives` is static (compile-time), inputs must be explicitly re-exposed.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Uses `hostDirectives` (verified API) over the repo's attribute-selector component pattern; first directives in the repo.
**Evidence:** `[host-directives]` composition API + static/inputs constraints; `[reduced-motion]` matchMedia change event.

#### Variant B: Single combined `[guiInteraction]` directive

**How it works:** One directive renders state layer + ripple + focus ring, with
boolean inputs to toggle parts (`ripple`, `focusRing`). Shares one set of
listeners and one interaction-state signal internally.

**Pros:**
- One set of pointer/focus listeners and one state model — no cross-directive coordination.
- Simplest consumer API (one attribute); easiest to keep state-layer/ripple/focus consistent (combined states, Req 1.8).

**Cons:**
- Less granular — always carries all logic even if a component wants only a focus ring.
- Larger single unit; toggling via inputs is slightly less tree-shakable than separate directives.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Single directive is simple to compose via `hostDirectives`; diverges from a "small primitives" philosophy.
**Evidence:** `[host-directives]`; `[reduced-motion]`.

#### Variant C: Shared service + thin directives + standalone utilities

**How it works:** A zoneless `InteractionState`/`ReducedMotion` service owns
listeners, the reduced-motion signal, and disabled tracking; thin directives
subscribe to it for rendering; a11y utilities (Area 4) are plain
functions/services usable without any directive.

**Pros:**
- Single owner of listeners/media-query (no duplication); reduced-motion + disabled reactivity centralized and reactive at runtime (Req 4.5, 5.3).
- Utilities usable outside the directives (Req 6.4, 7.1).

**Cons:**
- More architecture (service + directives) for a Medium-complexity spec.
- Indirection between the service and the directives.

**Effort:** Medium/High | **Risk:** Low
**Codebase fit:** Mirrors the service-owns-DOM pattern in `libs/ui/theme` (`M3StyleApplier` service); most layered of the three.
**Evidence:** `[style-applier]` service pattern; `[reduced-motion]`; `[after-next-render]`.

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. State layer | A: CSS pseudo-element | Low | Low | Closest to current `button.css`; adds missing `::before` |
| 1. State layer | B: Injected element + JS state | Medium | Medium | Matches `style-applier` renderer pattern |
| 1. State layer | C: Host `color-mix` (extend) | Low | Medium | Current pattern; lowest fidelity to M3 layer |
| 2. Ripple | A: Web Animations API | Medium | Low | Renderer/`afterNextRender` DOM creation |
| 2. Ripple | B: CSS keyframes + JS origin | Medium | Low | CSS-centric; pairs with 1A |
| 2. Ripple | C: `@angular/material` MatRipple | Low | High | Violates "from scratch" non-goal |
| 3. Focus | A: native `:focus-visible` | Low | Medium | Current pattern; programmatic-focus gap |
| 3. Focus | B: CDK `FocusMonitor` | Medium | Low | New dep; aligns w/ 4A/4B |
| 3. Focus | C: from-scratch origin tracker | Medium | Medium | "From scratch" ethos |
| 4. a11y | A: `@angular/aria` | Medium | Medium | Matches vision; Developer Preview; +CDK |
| 4. a11y | B: `@angular/cdk/a11y` only | Medium | Low | Stable; matches Req 6 generic scope |
| 4. a11y | C: from scratch | High | Medium | "From scratch"; most to own |
| 5. Packaging | A: 3 directives + hostDirectives | Medium | Low | Idiomatic composition |
| 5. Packaging | B: single combined directive | Medium | Low | Simplest API |
| 5. Packaging | C: shared service + thin directives | Med/High | Low | Mirrors `M3StyleApplier` |

## Cross-area dependencies

- **Adopting `@angular/aria` (4A) brings `@angular/cdk` transitively** (peer
  `@angular/cdk@21.2.13`), which makes **`FocusMonitor` (3B)** and the roving-
  tabindex managers available "for free." Choosing 4A nudges 3 toward B.
- **Choosing `@angular/cdk/a11y` (4B)** likewise makes **3B** the natural,
  no-extra-cost focus option.
- **Choosing from-scratch a11y (4C)** pairs naturally with the **from-scratch
  focus tracker (3C)** (no CDK present) and keeps the dependency footprint at
  zero — but then native `:focus-visible` (3A) is the only no-JS focus option,
  with its programmatic-focus gap.
- **Ripple Variant C (MatRipple, 2C)** drags in `@angular/material` and conflicts
  with every "from scratch" choice; if picked, it makes the CDK-based a11y
  variants (4A/4B) "free" but contradicts `vision.md`.
- **State-layer B (injected element)** gives the ripple (2A/2B) a layer to sit
  above (Req 2.3) and a shared interaction-state signal; **state-layer A/C**
  leave the ripple to manage its own stacking.
- **Packaging C (shared service)** is the cleanest home for the single
  reduced-motion media-query subscription and disabled tracking regardless of the
  other choices.

## Codebase Insights

- **No directives exist yet** — this spec introduces the repo's first
  `@Directive`(s). Conventions to mirror: attribute selectors with `gui` prefix
  (eslint `libs/ui/eslint.config.mjs`), standalone, `OnPush`, signal inputs,
  `host` metadata bindings, `protected` members for host bindings
  (`libs/ui/button/src/button.ts`).
- **State tokens are defined but unused** (`libs/ui/src/styles/tokens/_state.css`):
  hover 0.08, focus 0.12, pressed 0.12, dragged 0.16 — matching the M3 spec
  values. Components currently hard-code `8%`/`10%` in `color-mix()` instead.
- **SSR-safe DOM pattern already in the repo:** `libs/ui/theme/src/style-applier.ts`
  uses `RendererFactory2.createRenderer(null, null)` and adopts the SSR-serialized
  element on hydration. No `afterNextRender`/`PLATFORM_ID` usage exists yet, so
  the browser-gating pattern for DOM-injecting directives is new.
- **New secondary entry point mechanics** (e.g. `libs/ui/interaction`): add
  `ng-package.json` (`{"lib":{"entryFile":"src/index.ts"}}`), `src/index.ts`
  barrel, a `tsconfig.base.json` path alias, and list every spec file explicitly
  in `libs/ui/project.json` test `include` (specs outside `sourceRoot` are not
  auto-discovered). `GuiSize` lives at `libs/ui/src/lib/size.ts`.
- **Testing:** native Angular Vitest (`@nx/angular:unit-test`), jsdom, zoneless;
  specs use `TestBed.createComponent` + global `describe/it/expect`. jsdom does
  not implement layout or `Element.animate` fully — ripple geometry/animation
  tests may need mocking or browser-level verification (_needs investigation_).

## Sources

- [button-css] /Users/igorkatsuba/projects/ngguide/ui/libs/ui/button/src/button.css — read 2026-06-01
- [state-tokens] /Users/igorkatsuba/projects/ngguide/ui/libs/ui/src/styles/tokens/_state.css — read 2026-06-01
- [style-applier] /Users/igorkatsuba/projects/ngguide/ui/libs/ui/theme/src/style-applier.ts — read 2026-06-01
- [vision] /Users/igorkatsuba/projects/ngguide/ui/.projects/ngguide-ui/vision.md — read 2026-06-01
- [ng-aria-overview] https://angular.dev/guide/aria/overview — fetched 2026-06-01
- [ng-aria-npm] https://registry.npmjs.org/@angular/aria — fetched 2026-06-01 (v21.2.13; Developer Preview; peer @angular/cdk@21.2.13, @angular/core ^21||^22)
- [cdk-a11y] https://github.com/angular/components/blob/main/src/cdk/a11y/a11y.md — fetched 2026-06-01
- [mat-ripple] https://material.angular.dev/components/ripple ; source https://github.com/angular/components/tree/main/src/material/core/ripple — fetched 2026-06-01
- [waap] https://developer.mozilla.org/en-US/docs/Web/API/Element/animate — fetched 2026-06-01 (Baseline since 2020; no auto reduced-motion)
- [focus-visible] https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible ; https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus — fetched 2026-06-01 (Baseline since 2022; programmatic-focus gap)
- [reduced-motion] https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion — fetched 2026-06-01 (matchMedia + change event)
- [m3-states] https://m3.material.io/foundations/interaction/states/state-layers — JS-heavy, body unfetchable; opacity values via https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-state.scss — fetched 2026-06-01
- [m3-ripple] https://m3.material.io/foundations/interaction/states (ripple = pressed animation, origin at contact) ; corroborated https://css-tricks.com/how-to-recreate-the-ripple-effect-of-material-design-buttons/ — fetched 2026-06-01
- [after-next-render] https://angular.dev/api/core/afterNextRender ; https://angular.dev/api/core/afterEveryRender — fetched 2026-06-01 (browser-only)
- [host-directives] https://angular.dev/guide/directives/directive-composition-api — fetched 2026-06-01

## Open Questions

- [ ] Does the vision's "`@angular/aria`" intent override the Developer-Preview
      stability risk, or is `@angular/cdk/a11y`-only (Area 4B) an acceptable
      interim that still satisfies Req 6? (Decision for `spec:design`.)
- [ ] Confirm cross-browser baseline of `element.focus({ focusVisible: true })`
      before relying on it for the programmatic-focus case (affects Area 3A viability).
- [ ] Exact WAI-ARIA APG edge cases the roving-tabindex utility must cover
      (wrap-around, type-ahead, orientation, RTL, disabled-skip) — needed if
      Area 4C (from scratch) is chosen.
- [ ] How to test ripple geometry/animation under jsdom (no real layout / partial
      `Element.animate`) — mock, skip, or add a browser-level check.
- [ ] Whether the state-layer directive should ship its own CSS (and how, from a
      secondary entry point) or rely on consumer-side styles keyed off a class.

## Next Steps

`spec:design m3-interaction-foundation` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research m3-interaction-foundation` again — it will extend this catalogue rather than overwrite it.
