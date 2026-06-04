# Tooltips — M3 spec reference

> **Source:** [Tooltips — Material Design 3](https://m3.material.io/components/tooltips) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/tooltip` · **Group:** communication
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use tooltips to add additional context to a button or other UI element
- Two variants: plain and rich
- Use plain tooltips to describe elements or actions of icon buttons
- Use rich tooltips to provide more details, like describing the value of a feature
- Rich tooltips can include an optional title, link, and buttons
- Plain tooltip
- Rich tooltip

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Shape: Rich tooltips have more rounded corners
M2: Rich tooltips have slightly rounded corners
M3: Rich tooltips have more rounded corners and support dynamic color

## Specifications

### Plain tooltip
- Supporting text
- Container

#### Plain tooltip colors
Plain tooltip color roles used for light and dark themes:
- Inverse on surface
- Inverse surface

#### Plain tooltip measurements
Plain tooltip padding and size measurements

| Attribute | Value |
| --- | --- |
| Container height | 24dp |
| Padding | 8dp |

### Rich tooltip
- Subhead
- Container
- Supporting text
- Text button

#### Rich tooltip colors
Rich tooltip color roles used for light and dark themes:
- On surface variant
- Surface container
- On surface variant
- Primary

#### Rich tooltip measurements
Rich tooltip padding and size measurements

| Attribute | Value |
| --- | --- |
| Top padding | 12dp |
| Bottom padding | 8dp |
| Left and right padding | 16dp |

#### Rich tooltip configurations
Rich tooltips can have a headline, body, and up to two buttons. The headline and number of buttons can be configured.
- Subhead, supporting text, and two buttons
- Subhead, supporting text, and one button
- Subhead and supporting text
- Supporting text and one button
- Supporting text and two buttons

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Receive a tooltip message
- Activate a tooltip with a keyboard or switch input

### Interaction & style
Plain and rich tooltips without required actions should remain on screen long enough for people to receive the information without disrupting their existing flow or task.
Plain tooltips should remain on the screen temporarily after the cursor moves away
Tooltips can appear when an actionable element, like a button or navigation rail, is hovered or focused. However, this tooltip shouldn’t hide crucial information.
Rich tooltips can also appear by selecting an element instead of hovering or focusing on it.
Tooltips can appear on hover or focus to explain actions
Rich tooltips can appear when an element is selected

### Focus order
Tooltip containers should not block important information or prevent a person from completing an action.
Focus order within the rich tooltip moves top to bottom between interactive elements.
Avoid trapping screen reader and keyboard focus on rich tooltips.
People should be able to move linearly through the rest of the page.
- Parent element
- Inline link
- Text button

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on button, if available |
| Space or Enter | Activates the focused element |

### Labeling elements
Tooltips should have the Tooltip role, or similar.
Label all elements in the tooltip according to their own accessibility guidance.
The tooltip container should have the Tooltip role
