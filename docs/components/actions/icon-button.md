# Icon buttons — M3 spec reference

> **Source:** [Icon buttons — Material Design 3](https://m3.material.io/components/icon-buttons) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/icon-button` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Icon buttons must use a system icon with a clear meaning
- Two variants: default and toggle
- Many configurations: Color, size, width, and shape
- On web, display a tooltip describing the action while hovering
- In toggle buttons, use the outlined style of an icon for the unselected state, and the filled style for the selected state
Standard, filled unselected, filled selected, filled tonal, and outlined icon buttons

### M3 Expressive update
May 2025
Icon buttons now have a wider variety of shapes and sizes, changing shape when selected. When placed in button groups, icon buttons interact with each other when pressed. More on M3 Expressive
Variants and naming:
- Default and toggle (selection)
- Color styles are now configurations. (filled, tonal, outlined, standard)
Shapes:
- Round and square options
- Shape morphs when pressed
- Shape morphs when selected
Sizes:
- Extra small
- Small (default)
- Medium
- Large
- Extra large
Widths:
- Narrow
- Default
- Wide
- Five sizes
- Two shapes
- Three widths

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Variants and naming: Icon buttons were called toggle buttons. There are now two variants of icon buttons: default and toggle.
- Default icon buttons
- Toggle icon buttons

## Specifications

### Variants
- Default icon button
- Toggle icon button

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Default | Available | Available |
| Toggle (selection) | Available | Available |

### Configurations
- Five sizes
- Two shapes
- Four color styles
- Three widths

| Category | Options | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Size | Small (default) | Available | Available |
| XS, M, L, XL | -- | Available |
| Shape | Round (default) | Available | Available |
| Square | -- | Available |
| Color | Filled (default), tonal, outlined, standard | Available | Available |
| Width | Default | Available | Available |
| Narrow, wide | -- | Available |

### Anatomy
- Icon
- Container

### Color
There are four built-in color styles: filled, tonal, outlined, and standard. Default and toggle buttons use different color roles per style.
Note:
These color roles were chosen to create design coherence and familiarity. Other color roles can be used as long as the container and text have a 3:1 contrast ratio. For example, tertiary and on tertiary.
A: Filled, B: Tonal, C: Outlined, D: Standard
- Default
- Toggle, unselected
- Toggle, selected

|  | 1. Default | 2. Toggle, unselected | 3. Toggle, selected |
| --- | --- | --- | --- |
| Filled container Filled icon | Primary On primary | Surface container On surface variant | Primary On primary |
| Tonal container Tonal icon | Secondary container On secondary container | Secondary container On secondary container | Secondary On secondary |
| Outlined container Outlined icon | Outline variant (outline) On surface variant | Outline variant (outline) On surface variant | Inverse surface Inverse on surface |
| Standard icon | On surface variant | On surface variant | Primary |

### States

#### Filled button states

##### Default
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

##### Toggle
A: Unselected. B: Selected
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

#### Tonal button states

##### Default
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

##### Toggle
A: Unselected. B: Selected
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

#### Outlined button states

##### Default
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

##### Toggle
A: Unselected. B: Selected
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

#### Standard icon button states
The standard icon button’s container is invisible at rest, but visible when the state layer is applied.

##### Default
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

##### Toggle
A: Unselected. B: Selected
- Enabled
- Disabled (10% state layer)
- Hovered (8% state layer)
- Focused (12% state layer)
- Pressed (12% state layer)

### Shape morph

#### Pressed state
While pressed, icon buttons can morph to become more square.
Both round and square icon buttons should have the same pressed shape radius. The corner radius value differs for each button size. See full icon button corner measurements
A. Round, B. Square
- Enabled
- Hovered
- Pressed

#### When selected
In addition to changing shape when pressed, toggle icon buttons also change the resting shape from round (unselected) to square (selected) by default. If the resting shape is square, the selected shape should be round.
A. Round, B. Square
- Enabled
- Hovered
- Pressed
- Selected

### Measurements
A. Extra small B. Small C. Medium D. Large E. Extra large
- Icon size
- Default width size
- Narrow width size
- Wide width size

#### Target sizes
Extra small and small icon buttons must have a target size of 48x48dp or larger to be accessible.
A. Extra small icon button size B. Small icon button size
- Narrow width
- Default width
- Wide width

#### Button corner radius

|  | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| A. Round button | Full | Full | Full | Full | Full |
| B. Square button | 12dp | 12dp | 16dp | 28dp | 28dp |
| C. Pressed state | 8dp | 8dp | 12dp | 16dp | 16dp |

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Understand meaning of the icon
- Navigate to and activate an icon button
- When applicable, a tooltip should be available to help describe the icon button's purpose

### Interaction & style
Ensure the icon has contrast of at least 3:1 with the surface or background.
Icon buttons should have a 3:1 contrast ratio with the surface or background
Avoid using colors with contrast below 3:1

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on (non-disabled) icon button |
| Space or Enter | Activates the (non-disabled) icon button |

### Labeling elements
The accessibility label for icon buttons describes the action the button is executing, such as Add to favorites, Bookmark, or Send message.
The icon button label describes the action, such as Add to favorites for the heart icon

### Layout & density
Groups of similar components can be nested together inside a component, or they can stand alone. The target size of each icon button should be at least 48dp, even when nested.
Icon buttons can be used within other components, such as an app bar

#### Avoid applying density by default
Don't apply density to icon buttons by default. This lowers their targets below the required 48x48 CSS pixels minimum size.
Provide density options that allow people to choose a higher density, such as selecting a denser layout or changing the theme. Controls for adjusting density must maintain a target size of at least 48x48 CSS pixels.

### Hover
On web, icon buttons should display a tooltip with an accessibility label.
The tooltip label text should be clear and concise
