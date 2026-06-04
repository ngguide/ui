# Checkbox — M3 spec reference

> **Source:** [Checkbox — Material Design 3](https://m3.material.io/components/checkbox) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/checkbox` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use checkboxes (instead of switches or radio buttons) if multiple options can be selected from a list
- Label should be scannable
- Selected items are more prominent than unselected items
Unselected, selected (hover), and indeterminate checkboxes

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- States: New indeterminate states as well as error states for unselected, selected, and indeterminate
M2
M3

## Specifications

### Checkbox
- Container
- Icon

### Color
- Checkbox
- State-layer
- Icon

#### Adjacent text label color
Use the color role on surface for adjacent text labels. This remains the same even if interacting with the label or component.
The text color remains the same regardless if the checkbox is selected or not

### States
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

### Measurements

| Attribute | Value |
| --- | --- |
| Container size | 18dp |
| Container corner shape | 2dp |
| Icon size | 18dp |
| Icon alignment | Center-aligned |
| Target size | 48dp |
| State-layer size | 40dp |

## Accessibility

### Use cases
People should be able to use assistive technology to:
- Navigate to a checkbox
- Toggle the checkbox on and off
- Get appropriate feedback based on input type documented under Interaction & style

### Interaction & style
Users should be able to select either the text label or the checkbox to select an option.
A checkbox selected via the text label
The parent checkbox has three states: selected, unselected, and indeterminate.
Checkboxes can be selected or unselected regardless of the state of the other checkboxes in a group.
If some, but not all, child checkboxes are checked, the parent checkbox becomes indeterminate. Selecting an indeterminate parent checkbox will check all of its child checkboxes.
An indeterminate selection indicating that at least one checkbox is selected within a group

### Avoid applying density by default
Don't apply density to checkboxes by default — this lowers their targets below our best practice of 48x48 CSS pixels. Instead, give people a way to choose a higher density, like selecting a denser layout or changing the theme.
To ensure that this density setting can be easily reverted when it's active, keep all the targets to change it at minimum 48x48 CSS pixels each.

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Moves focus to the next enabled checkbox |
| Space | Toggles the focused checkbox (selects or deselects) |

### Labeling elements
If the UI text is correctly linked to the checkbox, assistive tech (such as a screen reader) will read the UI text followed by the component’s role.
The accessibility label for an individual checkbox is typically the same as its adjacent text label.
The accessibility label clearly states the text label of the checkbox
