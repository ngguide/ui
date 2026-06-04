# Button groups — M3 spec reference

> **Source:** [Button groups — Material Design 3](https://m3.material.io/components/button-groups) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/button-group` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Two variants: standard and connected
- Applies shape morph when pressed and selected
- Connected button groups replace the segmented button
- Works with all button sizes: XS, S, M, L, and XL
- Support for single-select, multi-select, and selection-required
Button groups can contain buttons and icon buttons

### M3 Expressive update
Button groups apply shape, motion, and width changes to buttons and icon buttons to make them more interactive. More on M3 Expressive
May 2025
New component added to catalog. Variants and naming:
- Added standard button group
- Added connected button group Use instead of segmented button, which is no longer recommended
Configurations:
- Works with all button sizes: XS, S, M, L, and XL
- Applies default shape to all buttons: round or square
Button groups are containers that hold buttons of many shapes and sizes

## Specifications

### Variants
- Standard button group
- Connected button group

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Standard button group | -- | Available |
| Connected button group | Available as segmented button | Available |

### Configurations
Configurations for both variants of button groups:
- Extra small
- Small
- Medium
- Large
- Extra large
- Single-select and multi-select
- Round and square

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Size | XS, S, M, L, XL | -- | Available |
| Default shape | Round, square | -- | Available |
| Selection | Single-select, multi-select, selection-required | Available as segmented button | Available |

### Anatomy
Button groups are invisible containers that add padding between buttons and modify button shape. They don’t contain any buttons by default.
- Container

#### Common layouts
Mix and match buttons and icon buttons for different scenarios.
- Label buttons
- Label buttons and icon buttons
- Extra small icon buttons
- Large icon buttons

#### Color
Button groups have no color properties. They can use the default button or toggle button color styles, like filled, tonal, and outlined. Avoid using standard icon buttons or text buttons, as they have no container treatment.
- Filled
- Tonal
- Outlined
- Elevated

### Selection & activation
Standard button groups add interaction between adjacent buttons when a button is selected or activated. This interaction changes the width, shape, and padding of the selected or activated button, which adjusts the width of buttons directly next to it.
A selected button changes shape, and briefly changes the width of itself and adjacent buttons
Connected button groups don’t add any interaction between buttons when selected or activated.
They only affect the shape of the button being selected or activated.
A selected button changes shape without affecting adjacent buttons

### States

#### Standard button group
When a button is pressed, standard button groups modify the width and shape of that button and adjacent buttons.
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
When a toggle button is selected in a standard button group, its shape should change between square and round. The color should change according to the button specs.
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Connected button group
Connected button groups have different shape changes than standard button groups. Selecting a button does not affect adjacent buttons.
Connected button group unselected states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
Connected button group selected states:
- Enabled
- Hovered
- Focused
- Pressed

### Measurements

#### Standard button group
Standard groups apply padding between all buttons. The amount of padding changes based on button size to ensure a minimum accessible target size of 48dp. More details on padding: Button specs, icon button specs
Standard button group inner padding:
- XS: 18dp
- S: 12dp
- M: 8dp
- L: 8dp
- XL: 8dp

#### Connected button group
For all connected button groups, use 2dp padding. This provides visual consistency at scale.
Round connected button group inner padding is 2dp at every size. The outer shape is fully round, and the inner shape remains square with the following corner sizes:
- XS: 4dp
- S: 8dp
- M: 8dp
- L: 16dp
- XL: 20dp
Square connected button group inner padding is 2dp at every size. The outer shape has the following corner sizes:
- XS: 4dp
- S: 8dp
- M: 8dp
- L: 16dp
- XL: 20dp

#### Minimum widths
Extra small and small connected button groups have 48dp target areas and a minimum width of 48dp.
- Extra small
- Small

### Density
Button groups adapt to density of the buttons inside. More on density
Button groups adapt to the height of the buttons inside, including when density is applied

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Navigate to and interact with each button in the group
- Identify when buttons are selected

### Interaction & style
Each button in a group should have a minimum 48x48dp target. Extra small and small button groups have larger inner padding to ensure accessible targets. Avoid reducing the padding in these sizes.
- Extra small button group
- Small button group

#### Initial focus
The button group container is not a focusable element. Initial focus should land on the first button in the group and then move to each button.
Initial focus should land on the first button, not on the container
Use Tab to navigate through each item in the group, and Space or Enter to select buttons.
- Initial focus
- Selected button

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Navigates to the next button |
| Space or Enter | Activates the focused button |

### Labeling elements
The button group container does not need to be labeled. Label each button according to the button and icon button accessibility guidance.
Label each button within the button group
