# Bottom sheets — M3 spec reference

> **Source:** [Bottom sheets — Material Design 3](https://m3.material.io/components/bottom-sheets) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/bottom-sheet` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use bottom sheets in compact and medium window sizes
- Two variants: standard and modal
- Content should be additional or secondary (not the app’s main content)
- Bottom sheets can be dismissed in order to interact with the main content
- Standard bottom sheet
- Modal bottom sheet

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Shape: Bottom sheets have a 28dp top corner radius
- Layout: New max-width of 640dp and an optional drag handle with an accessible 48dp hit target

## Specifications

Modal bottom sheets are above a scrim while standard bottom sheets don't have a scrim. Besides this, both variants of bottom sheets have the same specs.
- Container
- Drag handle (optional)
- Scrim

### Color
Bottom sheet color roles used for both light and dark schemes:
- Scrim*
- On surface variant
- Surface container low
*On Android platforms, the scrim color and opacity is automatically handled by the system UI.

### Measurements
Bottom sheet padding and size measurements
Bottom sheets span the full window width up to 640dp. When the window width exceeds 640dp, bottom sheets adjust to have a top margin of 56dp and side margins of 56dp.

| Attribute | Value |
| --- | --- |
| Drag handle alignment (horizontal) | Center |
| Drag handle padding top/bottom | 22dp |
| Top margin | 72dp |
| Top margin (window width > 640dp) | 56dp |
| Start/end margin (window width > 640dp) | 56dp |
| Width | Full width, up to max-width 640dp |
| Height | Variable |

## Accessibility

### Use cases
Users should be able to:
- Resize bottom sheets without having to rely on touch gestures

### Interaction & style

#### Touch target area
The top 48dp portion of the bottom sheet is interactive when user-initiated resizing is available and the drag handle is present.
To ensure touch target accessibility, the top portion of a bottom sheet can be reserved for resize interactions

#### Initial focus
The optional drag handle can be focused in the tab order and interacted with using non-touch inputs, such as keyboard or switch controls.
Visible focus shown on the drag handle affordance

#### Dragging
Include a single-pointer alternative for any action that can be completed by dragging.
Drag handles should cycle the bottom sheet through available heights when selected. If a drag handle can’t be used, add a button to do this action.
Interacting with the drag handle can quickly move a bottom sheet through preset heights
A bottom sheet can automatically resize to another height after interacting with the drag handle

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on drag handle |
| Space / Enter | Toggles between available heights |

### Labeling
Label only the drag handle. The accessibility role for the drag handle is “button.”
Label the drag handle
