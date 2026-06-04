# Segmented buttons — M3 spec reference

> **Source:** [Segmented buttons — Material Design 3](https://m3.material.io/components/segmented-buttons) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/segmented-button` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

Note:
connected button group
- Segmented buttons can contain icons, label text, or both
- Two variants: single-select and multi-select
- Use for simple choices between two to five items (for more items or complex choices, use chips)
- Single-select segmented button
- Multi-select segmented button

### M3 Expressive update
May 2025
The segmented button is no longer recommended. Use the connected button group instead. More on M3 Expressive

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Icons: Optional check icon to indicate selected state
- Layout: Taller container height of 40dp
- Name and variants: Segmented buttons were previously known as toggle buttons. They now have two official variants: single-select and multi-select.
- Shape: Fully rounded corners
- Typography: Labels use sentence case instead of all caps
Segmented buttons now have a container height of 40dp
M2: Segmented buttons had a small corner radius and label text in all caps
M3: Segmented buttons have fully rounded corners, sentence-case text, different height, and new color mappings

## Specifications

Note:
connected button group
- Container
- Icon (optional for unselected state)
- Label text

### Color
Segmented button color roles used for light and dark schemes:
- On surface
- Outline
- Secondary container
- On secondary container

### States

#### Unselected
Unselected button states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Selected
Selected button states:
- Selected
- Hovered on selected
- Focused on selected
- Pressed on selected

### Measurements
- Padding and container size
- Target size

| Attribute | Value |
| --- | --- |
| Container width | Dynamic based on labels |
| Segment width | Container width / total segments (Example: 1/3) |
| Height | 40dp |
| Outline width | 1dp |
| Label alignment | Center |
| Left/right padding | Min 12dp |
| Padding between elements | 8dp |
| Target size | 48dp |

#### Density
Density can be used in denser UIs where space is limited. Density is only applied to the height.
Each step down in density removes 4dp from the height

## Accessibility

Note:
connected button group

### Use cases
Users should be able to:
- Navigate to and activate segmented buttons with assistive tech
- Understand what each segment selection will do

#### Interaction & style
For keyboard navigation, Tab focuses on an individual segment.
For single-select segments, Space or Enter will select or unselect the focused segment.
For multi-select segments, Space or Enter will:
- select an un-selected segment
- select all of the segments
- un-select a selected segment
Use Tab to navigate through segments and Space/Enter to select/unselect.

#### Color contrast
Segmented buttons are clusters of similar components, so the outline should have at least a 3:1 contrast ratio with the background or surface. This helps distinguish each button.
Both a checkmark icon and a color change are used to distinguish selection. Make sure color isn’t the only way to show selection.
Use an outline with a surface contrast of at least 3:1
The segmented button shouldn't have a contrast outline less than 3:1

#### Initial focus
Focus will start in the first segment. Depending on the direction of the language, it is either the most left or the most right segment.
For single select and multi-select, the first segment will be focused regardless of selection state.
Focus begins on the left for left-to-right languages and on the right for right-to-left languages

#### Keyboard navigation

| Keys | Actions (single select) | Actions (multi select) |
| --- | --- | --- |
| Tab | Focus lands on next enabled segment | Focus lands on next enabled segment |
| Space or Enter | Select focused segment | Select and unselect focused segment |

#### Labeling elements
The accessibility label for a segmented button comes from the visible label text on such as Relevance and Distance. If the segmented button displays icons without label text, the accessibility label describes the action that the button is expressing, such as Inexpensive for one currency symbol.
The label for segmented button matches the text label
Single-select segmented buttons behave like radio buttons: only one option can be selected at a time. The label is Radiogroup.
Multi-select buttons behave like checkboxes: more than one option can be selected. The label is Checkbox.
The role for the multi-select segmented button is Checkbox
