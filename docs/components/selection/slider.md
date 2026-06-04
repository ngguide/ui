# Sliders — M3 spec reference

> **Source:** [Sliders — Material Design 3](https://m3.material.io/components/sliders) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/slider` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Three variants: Standard, centered, range
- Has five sizes, vertical and horizontal orientation, and an optional inset icon
- Sliders should present the full range of available values
- The slider value should take effect immediately
Sliders change values along a range

### M3 Expressive update
May 2025
The slider includes expressive configurations for orientation, shape sizes, and an inset icon. More on M3 Expressive
Updated on Android Views (MDC-Android) and Jetpack Compose.
Variants and naming:
- Changed continuous slider to standard slider
- The discrete slider is now the stops configuration
New configurations:
- Orientation: Horizontal, vertical
- Optional inset icon (standard slider only)
- Sizes: XS (existing default), S, M, L, XL
- Standard slider
- Centered slider
- Range slider

### Previous updates

#### Visual refresh to improve non-text contrast
Dec 2023: Updated on Android Views (MDC-Android) and Jetpack Compose.
- Configuration: Added centered configuration and range selection
- Shape: New shape for slider tracks and handles. Slider elements change shape when selected.
- Motion: Slider handle adjusts width upon selection. Slider tracks adjust in shape when sliding to the edge.
- Color: Refreshed color mappings
M3 visual refresh: Sliders have a stop indicator, larger label text, and a vertical handle that narrows when pressed. Centered sliders start from the middle instead of the leading edge.

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
M2: Sliders have a circular handle and a small label when pressed
M3: Sliders have new color mappings and support dynamic color

## Specifications

### Variants
- Standard
- Centered
- Range

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Standard | Available as “continuous” slider | Available |
| Centered | Available (web only) | Available |
| Range | Available | Available |
| Discrete | Available | Available as “stops” configuration |

### Configurations
- Orientation: Horizontal, vertical
- Size: XS, S, M, L, XL
- Inset icon
- Stops
- Value indicator

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Inset icon | No (default) | Available | Available |
| Yes | -- | Available |
| Orientation | Horizontal (default) | Available | Available |
| Vertical | -- | Available |
| Size | XS (default) | Available | Available |
| S, M, L, XL | -- | Available on Android Views (MDC-Android). Available as tokens on other platforms.* |
| Stop indicators | No (default), Yes | Available as “discrete” slider | Available |
| Value Indicator | No (default), Yes | Available | Available |

### Anatomy
- Value indicator (optional)
- Stop indicators (optional)
- Active track
- Handle
- Inactive track
- Inset icon (optional)

### Color
Slider color roles used for light and dark schemes (element → role):

| Element | Role |
| --- | --- |
| Active track | Primary |
| Handle | Primary |
| Inactive track | Secondary container |
| Stop indicator | On secondary container |
| Inset icon | On primary |
| Value indicator container | Inverse surface |
| Value indicator label | Inverse on surface |

### States
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

### Measurements
Padding and size measurements for common sliders
Padding and size measurements for XS, S, M, L, and XL sliders

| Attribute | XS | S | M | L | XL |
| --- | --- | --- | --- | --- | --- |
| Track height | 16dp | 24dp | 40dp | 56dp | 96dp |
| Label container height | 44dp |
| Label container width | 48dp |
| Handle height | 44dp | 44dp | 52dp | 68dp | 108dp |
| Handle width | 4dp |
| Track shape | 8dp | 8dp | 12dp | 16dp | 28dp |
| Inset icon size | -- | -- | 24dp | 24dp | 32dp |

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate to a slider
- Select a range by controlling a handle along a track
- Get appropriate feedback based on input type

### Interaction & style
The slider handle shrinks in width and the value appears to provide a visual cue to the user that the handle is being pressed.
Touch
When tapped or dragged, the handle width shrinks to provide interaction feedback, and the value appears.
Cursor
When hovered, the cursor changes. When clicked and dragged, the handle width shrinks, and the value appears.
The slider handle changes width during interaction

#### Focus and navigation
Initial focus lands directly on the handle, since it’s the primary interactive element of the slider.
The slider value can then be adjusted using the arrow keys or other keyboard navigation options.
Use arrow keys to change the slider value

### Color contrast
Use visual anchors so the end of the slider’s inactive track has at least 3:1 contrast with the background. The stop indicator makes the end easily visible on most backgrounds.
A stop indicator on the inactive track makes it easier to identify the end of the slider on a low-contrast background
Alternatively, icons or other elements that have a 3:1 contrast with the background can be used to indicate the ends of the slider’s inactive track.
Icons make it easier to identify the ends of the slider on a low-contrast background

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Moves focus to the slider handle |
| Arrows | Increase and decrease the value by one value or one stop indicator |
| Space & Arrows | Increase and decrease the value by one interval or one stop indicator |
| Home or End | Set the slider to the first and last values on the slider |

### Labeling elements
The accessibility label for a slider is typically the same as the slider's adjacent text label. It should have the slider role.
A slider’s accessibility label should match the adjacent UI text
If the UI text is correctly linked to the slider, assistive tech (such as a screenreader) will read the UI text followed by the component’s role.
Icon buttons placed outside the slider should have the button role
