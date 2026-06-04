# Side sheets — M3 spec reference

> **Source:** [Side sheets — Material Design 3](https://m3.material.io/components/side-sheets) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/side-sheet` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use side sheets to provide optional content and actions without interrupting the main content
- Two variants: standard and modal
- People can navigate to another region within the sheet
- Side sheets can contain a back icon for navigation
- Standard side sheet
- Modal side sheet

### Differences from M2
- Right-to-left (RTL) language support with left side sheet
- Color: New color mappings and compatibility with dynamic color
- Shape: Modal side sheets have a 16dp corner radius
Side sheets have new color mappings to support dynamic color

## Specifications

### Standard side sheet
- Divider (optional)
- Headline
- Container
- Close icon button

#### Standard side sheet color
Side sheet color roles used for light and dark themes:
- Outline variant
- On surface variant
- Surface
- On surface variant

#### Standard side sheet measurements
Side sheet padding and size measurements

| Attribute | Value |
| --- | --- |
| Start/end padding | 24dp |
| Padding between top elements | 12dp |
| Bottom actions height | 72dp |
| Bottom actions top padding | 16dp |
| Bottom actions bottom padding | 24dp |
| Bottom actions alignment (horizontal) | Left |
| Max-width | 400dp |
| Margins (when detached) | 16dp |

### Modal side sheet
- Back icon button (optional)
- Headline
- Container
- Close icon button
- Divider (optional)
- Action buttons (optional)
- Scrim

#### Modal side sheet color
Side sheet color roles used for light and dark themes:
- On surface variant
- Surface container low
- On surface variant

#### Modal side sheet measurements
Modal side sheet padding and size measurements

| Attribute | Value |
| --- | --- |
| Start/end padding | 24dp |
| Start padding with icon | 16dp |
| Padding between top elements | 12dp |
| Bottom actions height | 72dp |
| Bottom actions top padding | 16dp |
| Bottom actions bottom padding | 24dp |
| Bottom actions alignment (horizontal) | Left |
| Max-width | 400dp |
| Margins (when detached) | 16dp |

## Accessibility

### Use cases
People should be able to dismiss the side sheet using assistive technology.

### Interaction & style
Material requires that a close affordance, such as a close icon button, is always present within a side sheet.
A close icon button makes the side sheet easy to dismiss
Without a close icon button, people can’t predict the opening and closing flow of side sheets, or know if the sheet is transient or permanent

### Initial focus
Actions within a side sheet can be focused by tab order using a keyboard or switch control.
Visible focus shown on the available actions within a side sheet:
- Headline
- Close
- Cancel
- Save

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on (non-disabled) icon button |
| Space or Enter | Activates the (non-disabled) icon button |

### Labeling
The accessibility role for a side sheet is Dialog.
The role for side sheets is Dialog
