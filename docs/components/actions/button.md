# Buttons — M3 spec reference

> **Source:** [Buttons — Material Design 3](https://m3.material.io/components/buttons) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/button` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Two variants: default and toggle
- Can contain an optional leading icon
- Five color options: elevated, filled, tonal, outlined, and text
- Five size recommendations: extra small, small, medium, large, and extra large
- Two shape options: round and square
- Keep labels concise and use sentence case
- Elevated button
- Filled button
- Filled tonal button
- Outlined button
- Text button

### M3 Expressive update
May 2025
Buttons now have a wider variety of shapes and sizes, toggle functionality, and can change shape when selected. More on M3 Expressive
Variants and naming:
- Default and toggle (selection)
- Color styles are now configurations (elevated, filled, tonal, outlined, text)
Shapes:
- Round and square
- Shape morphs when pressed
- Shape morphs when selected
Sizes:
- Extra small
- Small (existing, default)
- Medium
- Large
- Extra large
New padding for small buttons:
- 16dp (recommended to match padding of new sizes)
- 24dp (no longer recommended)
- Five sizes
- Toggle (selection)
- Two shapes
- Two small padding widths

### Differences from M2
- Color: New color mappings and compatibility with dynamic color. Icons and labels now share the same color. Neutral text button is no longer recommended.
- Icons: Standard size for leading and trailing icons is now 20dp
- Shape: Fully-rounded corner radius and additional height options
M2: Buttons have a height of 36dp and slightly rounded corner radius
M3: Default buttons are taller at 40dp and have fully rounded corners

## Specifications

### Variants
- Default button
- Toggle button

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Default | Available | Available |
| Toggle (selection) | -- | Available |

### Configurations
- Size
- Shape
- Color
- Small button padding

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Size | Small (default) | Available | Available |
| XS, M, L, XL | -- | Available |
| Shape | Round (default) | Available | Available |
| Square | -- | Available |
| Color | Elevated, filled (default), tonal, outlined, text | Available | Available |
| Small button padding | 24dp | Available | Not recommended. Use 16dp |
| 16dp | -- | Available |

### Anatomy
- Container
- Label text
- Icon (optional)

### Color
- There are five built-in button color styles: elevated, filled, tonal, outlined, and text
- The default and toggle buttons use different colors
- Toggle buttons don’t use the text style
Note:
These color roles were chosen to create design coherence and familiarity. Other color roles can be used as long as the container and text have a 3:1 contrast ratio. For example, tertiary and on tertiary.
A. Elevated, B. Filled, C. Tonal, D. Outlined, E. Text
- Default
- Toggle: unselected
- Toggle: selected

|  | 1. Default | 2. Toggle unselected | 3. Toggle selected |
| --- | --- | --- | --- |
| Elevated container Elevated icon & label | Surface container low Primary | Surface container low Primary | Primary On primary |
| Filled container Filled icon & label | Primary On primary | Surface container On surface variant | Primary On primary |
| Tonal container Tonal icon & label | Secondary container On secondary container | Secondary container On secondary container | Secondary On secondary |
| Outlined container Outlined icon & label | Outline variant (outline) On surface variant | Outline variant (outline) On surface variant | Inverse surface Inverse on surface |
| Text icon & label | Primary | -- | -- |

### States

#### Elevated button states
The elevated button style has an elevation of 1 by default and 0 when disabled.

##### Default
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

##### Toggle
A. Unselected, B. Selected
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Filled button states

##### Default
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

##### Toggle
A. Unselected, B. Selected
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Tonal button states

##### Default
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

##### Toggle
A. Unselected, B. Selected
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Outlined button states
The outlined button’s container fill is invisible at rest, but the opacity and state layers behave the same as other button styles when disabled, hovered, focused, or pressed.

##### Default
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

##### Toggle
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

#### Text button style states
The text button’s container is invisible at rest, but the opacity and state layers behave the same as other button styles when disabled, hovered, focused, or pressed. There is no toggle text button.
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

### Shape morph

#### Pressed state
When pressed, buttons can morph to become more square. Both round and square buttons should have the same pressed shape.
The corner radius value differs for each button size. See full button corner measurements
A. Round button, B. Square button
- Enabled
- Hovered
- Pressed

#### When selected
In addition to changing shape when pressed, toggle buttons also change the resting shape from round (unselected) to square (selected).
If the resting unselected shape is square, the selected shape should be round.
A. Round button, B. Square button
- Enabled
- Hovered
- Pressed
- Selected

### Measurements
Padding and size measurements of each button size
- Extra small
- Small
- Medium
- Large
- Extra large

#### Target areas
Extra small and small icon buttons must have a target size of 48x48dp or larger to be accessible.
A. Extra small B. Small
- Round button
- Button with icon
- Square button

#### Corner sizes

|  | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| A. Round button | Full | Full | Full | Full | Full |
| B. Square button | 12dp | 12dp | 16dp | 28dp | 28dp |
| C. Pressed state | 8dp | 8dp | 12dp | 16dp | 16dp |

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Use a button to perform an action
- Navigate to and activate a button

### Interaction & style

#### Color contrast
Enabled buttons need a 3:1 contrast ratio with the background to meet accessibility best practices.
This is measured from the container for elevated, filled, and tonal button styles, and the label text for outlined and text button styles.
Higher contrast helps differentiate elements

#### 200% text size
Avoid excessive text wrapping or truncation by choosing concise strings.
On Android, button labels should be kept concise enough to fit within two lines after the text size is increased to 200%. If a button label exceeds this limit and gets truncated, provide an alternative way to access the full content in a single tap.
Avoid excessive text wrapping or truncation by choosing concise strings

#### Rapid clicks
On the web, you can use a modified motion curve to avoid resonant effects from overlapping animations. This provides a smoother experience for interactions where you anticipate multiple clicks or taps in succession.
Use the modified motion curve if rapid click or pointer interactions are expected

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Navigate to a button |
| Space or Enter | Activate a button |

### Labeling elements
The accessibility label for a button should match the visible label text on the button such as Done, Send, or Reply.
It can contain extra contextual information if necessary.
