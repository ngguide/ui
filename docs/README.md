# `@ngguide/ui` — M3 spec reference

Per-component transcriptions of the official [Material Design 3](https://m3.material.io) specification, captured from the live site with `agent-browser` and used as the strict-M3 reference for this UI kit (the kit is built from scratch to M3, not a wrapper around Angular Material).

Each component doc mirrors the source **Specs** tab — Variants, Configurations, Anatomy, Color roles, States, Shape morph, Measurements — plus a condensed **Overview** and the **Accessibility** facts (roles, keyboard, contrast). Spec *data* (measurements, color roles, token references) is factual and transcribed as-is; guidelines *prose* is condensed, with a link back to the source for full guidance. Per-token baseline numeric values stay in the interactive token table on each source page — they resolve to the global `--md-sys-*` system tokens already implemented under [`.specs/m3-tokens`](../.specs/m3-tokens).

_Captured 2026-06-04. Components grouped to match the `.specs/` feature groups._

## Actions

Buttons and button-like triggers.

| Component | Entry point | M3 source | Doc |
| --- | --- | --- | --- |
| Buttons | `@ngguide/ui/button` | [m3](https://m3.material.io/components/buttons) | [`actions/button.md`](actions/button.md) |
| FABs (+ Extended FAB) | `@ngguide/ui/fab` | [m3](https://m3.material.io/components/floating-action-button) | [`actions/fab.md`](actions/fab.md) |
| Icon buttons | `@ngguide/ui/icon-button` | [m3](https://m3.material.io/components/icon-buttons) | [`actions/icon-button.md`](actions/icon-button.md) |
| Button groups | `@ngguide/ui/button-group` | [m3](https://m3.material.io/components/button-groups) | [`actions/button-group.md`](actions/button-group.md) |
| Segmented buttons | `@ngguide/ui/segmented-button` | [m3](https://m3.material.io/components/segmented-buttons) | [`actions/segmented-button.md`](actions/segmented-button.md) |
| Split buttons | `@ngguide/ui/split-button` | [m3](https://m3.material.io/components/split-button) | [`actions/split-button.md`](actions/split-button.md) |
| FAB menu | `@ngguide/ui/fab-menu` | [m3](https://m3.material.io/components/fab-menu) | [`actions/fab-menu.md`](actions/fab-menu.md) |

## Communication

Status, feedback and helper surfaces.

| Component | Entry point | M3 source | Doc |
| --- | --- | --- | --- |
| Badges | `@ngguide/ui/badge` | [m3](https://m3.material.io/components/badges) | [`communication/badge.md`](communication/badge.md) |
| Progress indicators | `@ngguide/ui/progress` | [m3](https://m3.material.io/components/progress-indicators) | [`communication/progress.md`](communication/progress.md) |
| Loading indicator | `@ngguide/ui/loading-indicator` | [m3](https://m3.material.io/components/loading-indicator) | [`communication/loading-indicator.md`](communication/loading-indicator.md) |
| Snackbar | `@ngguide/ui/snackbar` | [m3](https://m3.material.io/components/snackbar) | [`communication/snackbar.md`](communication/snackbar.md) |
| Tooltips | `@ngguide/ui/tooltip` | [m3](https://m3.material.io/components/tooltips) | [`communication/tooltip.md`](communication/tooltip.md) |

## Containment

Surfaces that group or contain other content.

| Component | Entry point | M3 source | Doc |
| --- | --- | --- | --- |
| Cards | `@ngguide/ui/card` | [m3](https://m3.material.io/components/cards) | [`containment/card.md`](containment/card.md) |
| Carousel | `@ngguide/ui/carousel` | [m3](https://m3.material.io/components/carousel) | [`containment/carousel.md`](containment/carousel.md) |
| Dialogs | `@ngguide/ui/dialog` | [m3](https://m3.material.io/components/dialogs) | [`containment/dialog.md`](containment/dialog.md) |
| Divider | `@ngguide/ui/divider` | [m3](https://m3.material.io/components/divider) | [`containment/divider.md`](containment/divider.md) |
| Lists | `@ngguide/ui/list` | [m3](https://m3.material.io/components/lists) | [`containment/list.md`](containment/list.md) |
| Bottom sheets | `@ngguide/ui/bottom-sheet` | [m3](https://m3.material.io/components/bottom-sheets) | [`containment/bottom-sheet.md`](containment/bottom-sheet.md) |
| Side sheets | `@ngguide/ui/side-sheet` | [m3](https://m3.material.io/components/side-sheets) | [`containment/side-sheet.md`](containment/side-sheet.md) |

## Selection

Controls for choosing values and options.

| Component | Entry point | M3 source | Doc |
| --- | --- | --- | --- |
| Checkbox | `@ngguide/ui/checkbox` | [m3](https://m3.material.io/components/checkbox) | [`selection/checkbox.md`](selection/checkbox.md) |
| Radio button | `@ngguide/ui/radio` | [m3](https://m3.material.io/components/radio-button) | [`selection/radio.md`](selection/radio.md) |
| Switch | `@ngguide/ui/switch` | [m3](https://m3.material.io/components/switch) | [`selection/switch.md`](selection/switch.md) |
| Chips | `@ngguide/ui/chip` | [m3](https://m3.material.io/components/chips) | [`selection/chip.md`](selection/chip.md) |
| Sliders | `@ngguide/ui/slider` | [m3](https://m3.material.io/components/sliders) | [`selection/slider.md`](selection/slider.md) |
| Menus | `@ngguide/ui/menu` | [m3](https://m3.material.io/components/menus) | [`selection/menu.md`](selection/menu.md) |

## Text inputs

Text entry and date/time pickers.

| Component | Entry point | M3 source | Doc |
| --- | --- | --- | --- |
| Text fields | `@ngguide/ui/text-field` | [m3](https://m3.material.io/components/text-fields) | [`text-inputs/text-field.md`](text-inputs/text-field.md) |
| Date pickers | `@ngguide/ui/date-picker` | [m3](https://m3.material.io/components/date-pickers) | [`text-inputs/date-picker.md`](text-inputs/date-picker.md) |
| Time pickers | `@ngguide/ui/time-picker` | [m3](https://m3.material.io/components/time-pickers) | [`text-inputs/time-picker.md`](text-inputs/time-picker.md) |

## Foundations & styles (no component page)

These library entry points implement M3 **foundations/styles**, not catalogue components, so they have no per-component doc here — they trace to the foundation specs and their own `.specs/` groups:

| Entry point | M3 reference | Spec group |
| --- | --- | --- |
| `@ngguide/ui/interaction` | [Interaction states](https://m3.material.io/foundations/interaction/states/overview) | [`.specs/m3-interaction-foundation`](../.specs/m3-interaction-foundation) |
| `@ngguide/ui/theme` | [Color system](https://m3.material.io/styles/color/system/overview) · [Dynamic color](https://m3.material.io/styles/color/roles) | [`.specs/m3-dynamic-color`](../.specs/m3-dynamic-color), [`.specs/m3-tokens`](../.specs/m3-tokens) |
| `@ngguide/ui/icon` | [Icons](https://m3.material.io/styles/icons/overview) | — |
| `@ngguide/ui/overlay`, `/datetime`, `/forms`, `/tooling` | internal support primitives | — |

---

> Spec text and tables are © Google, reproduced here under fair use as a factual implementation reference; see each component's source link for the authoritative, up-to-date specification.
