# Split buttons — M3 spec reference

> **Source:** [Split buttons — Material Design 3](https://m3.material.io/components/split-button) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/split-button` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use to show an action with a menu of related actions
- Same size range as buttons and icon buttons: XS, S, M, L, XL
Split buttons are made of a common button and a menu icon button

### M3 Expressive update
May 2025
The split button has a separate menu button that spins and changes shape when activated. It can be used alongside other buttons of the same size. More on M3 Expressive
New component added to catalog. Sizes:
- Extra small
- Small
- Medium
- Large
- Extra large
Color styles:
- Elevated
- Filled
- Tonal
- Outlined
Split buttons have the same five recommended sizes as label and icon buttons

## Specifications

### Variants

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Split button | -- | Available |

### Configurations
- Color configurations: Elevated, filled, tonal, outlined
- Size configurations: XS, S, M, L, XL

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Size | XS, S, M, L, XL | -- | Available |
| Color | Elevated, filled, tonal, outlined | -- | Available |

### Anatomy
- Leading button
- Icon
- Label text
- Trailing button
The leading button in split buttons can have an icon, label text, or both. The trailing button should always have a menu icon.
- Label + icon
- Label
- Icon

### Color
Split buttons use the same color schemes as standard buttons. However, unlike toggle buttons, the split button color doesn’t change when selected—only a state layer is applied.
Split buttons use the same colors and state layers as buttons, shown in the following token module. Go to buttons for more details.
A: Unselected, B: Selected trailing icon
- Elevated
- Filled
- Tonal
- Outlined

### States
Split button states use the same colors and state layers as buttons and icon buttons. Go to those specs for details.

#### Leading button shape
The inner corners change shape for hovered, focused, and pressed states.
- Enabled
- Disabled
- Hovered
- Focused
- Pressed, pressed with focus

#### Trailing button shape
The inner corners change shape for hovered, focused, and pressed states, and the icon becomes centered when selected.
- Enabled
- Disabled
- Hovered
- Focused
- Pressed, pressed with focus
- Selected, selected with focus

### Measurements
Text and icons are optically centered when the buttons are asymmetrical. They’re centered normally when symmetrical.
Menu icon offset when unselected:
- XS: -1dp from center
- S: -1dp from center
- M: -2dp from center
- L: -3dp from center
- XL: -6dp from center
The inner corner radius changes depending on button sizing. The space should always be 2dp.
- Extra small 4dp
- Small 4dp
- Medium 4dp
- Large 8dp
- Extra large 12dp

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate to each button and interact with them
- Navigate to any element opened by the trailing button
- Understand the current selection state of the button

### Interaction & style
Each button in the split button needs a minimum target area of 48x48dp. Extra small and small split buttons are shorter than 48dp, so the target areas around them need to be at least 48dp tall.
Target areas should be at least 48x48dp
- Extra small
- Small

### Initial focus
Focus should land on the leading button then move to the trailing button. This can depend on the operating system’s settings.
- Left to right
- Right to left

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Navigate between buttons |
| Space or enter | Activate focused button |

### Labeling elements
The accessibility label for the leading button is the same as buttons.
Leading buttons should have the same labels as common buttons
The trailing icon button should have an extra state or similar label indicating that the menu is expanded or collapsed. Label the button to clearly indicate that there are more options. The label of the secondary button should indicate that it provides additional choices related to the action of the main button. For instance, if the main button says "Watch later," the secondary button should be something like "More watch options." Label the opened menu according to the menu accessibility guidance.
Trailing buttons should communicate the state of the menu and that more options are available
