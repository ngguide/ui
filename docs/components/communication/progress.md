# Progress indicators — M3 spec reference

> **Source:** [Progress indicators — Material Design 3](https://m3.material.io/components/progress-indicators) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/progress` · **Group:** communication
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Two variants: linear and circular
- Use the same configuration for all instances of a process (like loading)
- They capture attention through motion
- Option to apply a wave to the active track for use cases that would benefit from increased expressiveness
Linear and circular progress indicators have visual configurations for shape and thickness

### M3 Expressive update
Aug 2024
The progress indicators have configurations for height and wavy shape. Choose the visual style that best fits your product. More on M3 Expressive
- Track height: Configurable
- Shape: Wavy
Progress indicators have a new rounded, colorful style, and more configurations to choose from, including a wavy shape and variable track height

### Previous updates
Dec 2023: Non-text contrast (NTC)
- Anatomy: Added an end stop indicator to improve accessibility
- Contrast: Higher contrast between track and active indicator to enhance the perception of progress
- Motion: New motion behavior
- Shape: Rounded corners
Progress indicators have a new rounded, colorful style

### Differences from M2
July 2022: Added to Material 3
- Color: New color mappings and compatibility with dynamic color
M2: Progress indicators have a boxier, neutral style
M3: Progress indicators are compatible with dynamic color

## Specifications

### Variants
- Linear progress indicator
- Circular progress indicator

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Linear progress indicator | Available | Available |
| Circular progress indicator | Available | Available |

### Configurations
- Behavior: Determinate and indeterminate
- Thickness: Default (4dp) and variable
- Shape: Flat and wavy

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Behavior | Determinate (default), Indeterminate | Available | Available |
| Track thickness | Fixed (4dp) | Available | Available |
| Configurable | -- | Available |
| Shape | Flat (default) | Available | Available |
| Wavy | -- | Available |

### Anatomy
- Active indicator
- Track
- Stop indicator

### Color
Progress indicator color roles used for light and dark schemes:
- Primary
- Secondary container

### Measurements
Wavy indicators use amplitude and wavelength to determine the shape of the wave. The height is the overall container height.
Amplitude measures from the center of the resting position to the center of the peak
Wavelength measures the distance between two adjacent peaks
Size measurements for linear progress indicators. The thicker variants are provided as sample measurement for makers to adjust the default version based on their use cases.
Size measurements for circular progress indicators. The thicker variants are provided as sample measurement for makers to adjust the default version based on their use cases.
The linear progress indicator is inset from the edge of the screen by 4dp

## Accessibility

### Use cases
People should be able to do the following using the assistive technology:
- Navigate to the progress indicator
- Understand what progress the indicator is communicating

### Interaction & style
The active indicator, which displays progress, provides visual contrast of at least 3:1 against most background colors.
The progress indicator and stop indicator provide visual contrast of at least 3:1 against most background colors
When integrated into another component, such as a button, make sure that the active indicator provides visual contrast of at least 3:1 against the other component.
For the active indicator, use the same color as the label text or icon. The track should be removed.
Ensure the indicator’s color provides at least 3:1 contrast against the surface it's on
Avoid using a color below 3:1 contrast
For linear progress indicators, the stop indicator is required if the track has a contrast below 3:1 with its container or the surface behind the container.
Essentially, the end of the track must be easy to identify.
Only remove the stop indicator when the linear progress indicator has at least a 3:1 color contrast with surrounding containers and surfaces
Avoid removing the stop indicator if any adjacent containers or surfaces are below the 3:1 color contrast

### Labeling elements
Since the progress indicator is a visual cue, it needs an accessibility label to describe the kind and amount of progress made.
Use the progress bar accessibility role, and write an accessibility label that describes the purpose of the progress indicator. The label should include the process, such as "loading,” and the affected content, such as a page, article, or episode. For example: "Loading news article" or "Refreshing page."
Progress indicator labels should explain which items are loading
A label on an intedeterminate progress indicator on a screen which is loading a set of podcast episodes
