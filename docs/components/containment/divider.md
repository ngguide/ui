# Divider — M3 spec reference

> **Source:** [Divider — Material Design 3](https://m3.material.io/components/divider) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/divider` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Make dividers visible but not bold
- Only use dividers if items can’t be grouped with open space
- Use dividers to group things, not separate individual items
Dividers separating items in a list

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Configurations: Ability to have vertical dividers
Dividers have new color mappings

## Specifications

- Divider

### Color
Divider color roles used for light and dark schemes:
- Outline variant

### Measurements
Measurements

| Attribute | Value |
| --- | --- |
| Divider thickness | 1dp |
| Divider full-width | 100% |
| Divider inset left margin | 16dp |
| Divider inset right margin | 0dp |
| Divider middle-inset left margin | 16dp |
| Divider middle-inset right margin | 16dp |

The following spacings are owned by the consuming list/layout context (not intrinsic divider geometry) and are therefore applied by the host layout rather than baked into the divider component:

| Attribute (list/layout context) | Value |
| --- | --- |
| Space between divider & supporting-text | 4dp |
| Divider right margin | 8dp |
| Divider bottom margin | 8dp |

## Accessibility

Dividers are decorative elements, which have no contrast minimums.
Decorative elements have no contrast minimums
