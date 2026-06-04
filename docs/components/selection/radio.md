# Radio button — M3 spec reference

> **Source:** [Radio button — Material Design 3](https://m3.material.io/components/radio-button) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/radio` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use radio buttons (not switches) when only one item can be selected from a list
- Label should be scannable
- Selected items are more prominent than unselected items
Radio buttons can be selected

### Resources & availability

| Type | Resource | Status |
| --- | --- | --- |
| Design |
| Design Kit (Figma) | Available |
| Implementation |
| Flutter | Available |
| android Jetpack Compose | Available |
| android Android Views (MDC-Android) | Available |
| language Web | Available |

### What’s new
- Color: New color mappings and compatibility with dynamic color
Radio buttons feature new color mappings

## Specifications

- Radio button icon

### Color
Radio button color roles used for light and dark themes:
- Primary
- On surface variant

#### Adjacent text label color
Use the color role on surface for adjacent text labels. This remains the same even if interacting with the label or component.
The text color remains the same regardless if the button is selected or not

### States
- Enabled
- Hover
- Focus
- Pressed
- Disabled
State specs are in the token module above

### Measurements
Radio button size measurements

| Attribute | Value |
| --- | --- |
| Icon size | 20dp |
| State layer size | 40dp |
| Target size | 48dp |

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Navigate to a radio button
- Select a radio button
- Get appropriate feedback based on input type

### Interaction & style
A radio button can be either selected or unselected. Selecting one radio button deselects any others. A radio group can start with one radio button selected, or none selected.
Once a radio button is selected, the group can’t be deselected. To let people opt out of their selection, either provide a Not applicable or No option radio button, or provide a separate way to deselect all radio buttons, like Clear selection.
People should be able to select either the text label or the radio button to select an option.
Only one radio button is selected at a time

#### Avoid applying density by default
Don't apply density to radio buttons by default. This lowers their targets below Material's recommendation of 48x48 CSS pixels. Instead, give people a way to choose a higher density, like selecting a denser layout or changing the theme.
To ensure this density setting can be easily reverted when it's active, keep all targets to change it at a minimum of 48x48 CSS pixels each.

### Initial focus
When outside the radio group, Tab moves focus directly to the selected radio button, or the first one if none are selected.
Shift+Tab instead focuses on the last radio if none are selected.
Use the arrows to navigate between options.
Tab brings the focus to the initially selected item or the initial radio option
Arrows move to next element in a list

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Moves focus into the group to the selected radio button, or the first if none are selected |
| Shift + Tab | Moves focus into the group to the selected radio button, or the last if none are selected |
| Arrows | Moves focus and selects the previous or next radio button. Wraps focus and selection between the first and last radio buttons. |
| Space | Selects a focused radio button. If already selected, does nothing. |

### Labeling elements
If the UI text is correctly linked to the radio button, assistive tech such as a screenreader will read the UI text, followed by the component’s role.
The accessibility label for a group of radio buttons is typically the same as its title. The role is Radio group.
Label the radio group based on the category title
The accessibility label for an individual radio button is typically the same as its adjacent text label.
Label the radio button based on its label text
