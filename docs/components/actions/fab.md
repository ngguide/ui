# FABs — M3 spec reference

> **Source:** [FABs — Material Design 3](https://m3.material.io/components/floating-action-button) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/fab` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use a FAB for the most common or important action on a screen
- Make sure the icon in a FAB is clear and understandable
- FABs persist on the screen when content is scrolling
- Three variants: FAB, medium FAB, large FAB
- FAB
- Medium FAB
- Large FAB

### M3 Expressive update
May 2025
The FAB has new sizes to match the extended FAB and more color options. The small FAB is no longer recommended. More on M3 Expressive
Variants and naming:
- Added medium FAB size
- Small FAB size is no longer recommended
- FAB and large FAB sizes are unchanged
- FAB variants are based on size, not color
Color:
- Added tone color styles: Primary Secondary Tertiary
- Renamed existing tonal color styles to match their token names: Primary to Primary container Secondary to Secondary container Tertiary to Tertiary container The values haven't changed
- Surface color FABs are no longer recommended
FABs have updated colors and sizes

### Differences from M2
M2: FABs are circles and always have a drop shadow
M3: FABs have a boxier shape, can use dynamic color, and include a new large FAB variation

## Specifications

### Variants
- FAB
- Medium FAB
- Large FAB

#### Baseline variants
The small FAB is still available, but no longer recommended. Jump to baseline specs
1. Small FAB

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| FAB | Available | Available |
| Medium FAB | -- | Available |
| Large FAB | Available | Available |
| Small FAB | Available | Not recommended. Use a larger size. |

### Configurations
In the expressive update, the primary, secondary, and tertiary set colors were renamed to primary container, secondary container, and tertiary container to match the actual color roles used. New primary, secondary, and tertiary color styles were created to match the corresponding color roles. View details in the color styles section

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Color | Primary container, secondary container, tertiary container | Available as primary, secondary, tertiary | Available |
| Primary. secondary, tertiary | -- | Available |

### Anatomy
1. Container
2. Icon

### Color

#### Color styles
FABs can use several combinations of color and on-color styles, such as primary and on-primary. The following color mappings provide the same legibility and functionality, so the color mapping you use depends on style alone.
- Primary container & On primary container (default)
- Secondary container & On secondary container
- Tertiary container & On tertiary container
- Primary & On primary
- Secondary & On secondary
- Tertiary & On tertiary

#### Baseline color styles
Surface FAB color styles are still available, but no longer recommended.
- Surface FABs

### States
- Enabled
- Hovered (8% state layer) - elevation 4
- Focused (12% state layer)
- Pressed (12% state layer)

### Measurements

#### FAB
FAB size measurements
FAB padding measurements

#### Medium FAB
Medium FAB size measurements
Medium FAB padding measurements

#### Large FAB
Large FAB size measurements
Large FAB padding measurements

## Extended FAB

### Variants
- Small extended FAB
- Medium extended FAB
- Large extended FAB

#### Baseline variants
The baseline extended FAB is no longer recommended in the M3 expressive update. Use a small extended FAB; the type style was updated from label large to title medium, and the inner padding was reduced. View baseline extended FAB specs
- Extended FAB

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Small extended FAB | -- | Available |
| Medium extended FAB | -- | Available |
| Large extended FAB | -- | Available |
| Extended FAB (baseline) | Available | Not recommended. Use small extended FAB. |

### Anatomy
- Container
- Label text
- Icon

### Color

#### Color styles
Extended FABs can use several combinations of color and on color styles, such as primary and on primary. The following color mappings provide the same level of contrast and functionality, so choose a color mapping based on visual preference.
Extended FAB color roles used for light and dark schemes:
- Primary container & on primary container (default)
- Secondary container & on secondary container
- Tertiary container & on tertiary container
- Primary & on primary
- Secondary & on secondary
- Tertiary & on tertiary

#### Baseline color styles
Extended FABs should no longer use surface color styles. They’re still available, but not recommended.
- Surface container FAB

### States
When using a non-default color mapping for extended FABs, make sure the state layer color is the same as the icon color. For example, the state layer color for primary mapping should be md.sys.color.primary.
- Enabled
- Hovered - elevation 4
- Focused
- Pressed

### Measurements
Size and padding measurements of the small, medium, and large extended FABs
Extended FABs should have margins of 16dp

### Baseline extended FAB
- Container
- Label text
- Icon

#### Baseline configurations
With icon
Without icon

#### Baseline colors
Extended FAB color roles used for light and dark schemes:
- Primary container + shadow
- On primary container

##### Additional color mappings
Extended FABs can use other combinations of container and icon colors. The color mappings below provide the same legibility and functionality as the default, so the color mapping you use depends on style alone.
Extended FABs can use different combinations of container and icon colors

#### Baseline states
- Enabled
- Hovered
- Focused
- Pressed

#### Baseline measurements
Extended FABs have a padding of 16dp
Extended FAB height, width, and icon size

| Attribute | Value |
| --- | --- |
| Container height | 56dp |
| Container width | Dynamic, 80dp min |
| Container shape | 16dp corner radius |
| Icon size | 24dp |
| Padding | 16dp |

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate to and activate the FAB
- Perform an action with the FAB
- Expand and minimize an extended FAB

### Interaction & style
Don't disable the FAB. If the action represented in the FAB is unavailable, the FAB shouldn't appear.
Ensure the icon has a minimum 3:1 contrast ratio with the container.
FAB icons are above the 3:1 contrast ratio
Avoid using colors with a contrast below 3:1

### Focus
Ensure the FAB is prioritized in the overall focus order to create an efficient experience for people who navigate UIs with assistive tech. On mobile, the focus order may start with the app bar, move to the navigation bar, and then skip past any other content on the page to land on the FAB. Consider displaying a tooltip when the FAB is focused. This is supported on web.
Tooltips surface the FAB’s label when focused

### Layout & position
To make it easier for users of screen readers to reach a primary action such as a FAB on expanded window sizes, consider placing the FAB in the upper left region. However, it’s critical to test placement options with users to see if the upper left region is the best position in all browser windows. For compact and medium window sizes, the best place for the FAB is the lower right corner of a screen.
In compact windows, place the FAB in the bottom trailing edge
In expanded windows, place the FAB in the navigation rail
To ensure accessibility for keyboard users on the web, avoid positioning the FAB in a way that completely obscures the focus indicator of an actionable element. It’s okay to partially cover the desired element, as long as the focus indicators are still visible.
The FAB can partially cover an actionable element, as long as the focus indicator is still clearly visible
Don’t completely obscure an actionable element and its focus indicator

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on the FAB |
| Space or Enter | Perform the default action on an item |

### Labeling elements
The accessibility label should describe the action that the button is performing, such as Compose a new message.
The accessibility label of the FAB with a pencil icon describes the action of composing a new message
