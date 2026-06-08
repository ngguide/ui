# Loading indicator — M3 spec reference

> **Source:** [Loading indicator — Material Design 3](https://m3.material.io/components/loading-indicator) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/loading-indicator` · **Group:** communication
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Recommended as a replacement for indeterminate circular progress indicators
- Always reflect an ongoing process and are never simply decorative
- Used for pull-to-refresh interactions
- Not used for processes that transition from indeterminate to determinate
- Capture attention through motion
- Loading indicator
- Contained loading indicator

### M3 Expressive update
May 2025
The loading indicator is designed to show progress that loads in under five seconds. It should replace most uses of the indeterminate circular progress indicator. More on M3 Expressive
New component added to catalog.
Loading indicators:
- Are used in pull-to-refresh functionality
- Can be contained or uncontained
- Use shape and motion to capture attention
- Can scale in size
Loading indicators are used in the pull-to-refresh behavior

## Specifications

### Variants
- Loading indicator

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Loading indicator | -- | Available |

### Configurations
- Default
- Contained

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Containment | Default | -- | Available |
| Contained | -- | Available |

### Anatomy
- Active indicator
- Container

### Color

#### Default
Loading indicator color roles used for light and dark schemes:
- Primary

#### Contained
Contained loading indicator color roles used for light and dark schemes:
- On primary container
- Primary container

### Measurements
To ensure sufficient margins, the size is 48dp while the shape container is 38dp

### Motion
The active indicator is a looping sequence of morphs between **7 different shapes**
while the canvas rotates (overview video alt text: "a looping sequence of morphs
between 7 different shapes in a darker color, sitting on a circular background
container in lighter color"). The reference shapes are Material's
`IndeterminateIndicatorPolygons`: soft burst → 9-sided cookie → pentagon → pill →
sunny → 4-sided cookie → oval, then back to the start.

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Navigate to the loading indicator
- Understand what progress the indicator is communicating
- Initiate a content refresh without relying on a gesture

### Interaction & style
The active indicator, which displays progress, provides visual contrast of at least 3:1 against most container and surface colors. The indicator itself must have 3:1 contrast with the background, but the container does not.
The loading indicator provides visual contrast of at least 3:1 against most background colors
When integrated into another component, such as a button, make sure that the active indicator provides a visual contrast of at least 3:1 against the other component.
Ensure at least 3:1 contrast between the indicator and the surface it's on
Avoid using when the contrast is under 3:1
Pull-to-refresh interactions can’t be accessible by just swiping. Provide an alternate way to refresh the content with a single pointer, such as placing a refresh button in a menu or directly alongside the content.
The refresh action can be in an app bar

### Labeling elements
Since the loading indicator is a visual cue, it needs an accessibility label to assist people who can't rely on visuals. It should use the progress bar accessibility role. Write a label describing the purpose of the loading indicator, such as loading news article or refreshing page.
Loading indicator labels should explain which items are loading
