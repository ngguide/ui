# Chips — M3 spec reference

> **Source:** [Chips — Material Design 3](https://m3.material.io/components/chips) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/chip` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use chips to show options for a specific context
- Four variants: assist, filter, input, and suggestion
- Chip elevation defaults to 0 but can be elevated if they need more visual separation
- Assist chip
- Filter chip
- Input chip
- Suggestion chip

### Updates
Aug 2024
Updated stroke color from outline to outline variant.
The stroke color was softened to improve visual hierarchy between chips and buttons

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Shape: Rounded rectangle
- Variants: Action chips have been separated into assist chips and suggestion chips. Choice chips are now a subset of filter chips
M2: Variants of chips are input, choice, filter, and action chips
M3: Variants of chips updated to assist, filter, input, and suggestion chips

## Specifications

### Assist chip
- Container
- Label text
- Leading icon

#### Assist chip color
Assist chip color roles used for light and dark themes:
- Surface container low (optional)
- On surface
- Outline
- Primary

#### Assist chip states
Selected and unselected assist chip states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

#### Assist chip measurements
Assist chip padding and size measurements

| Attribute | Value |
| --- | --- |
| Height | 32dp |
| Shape | 8dp corner radius |
| Icon size | 18dp |
| Vertical label text alignment | Center-aligned |
| Horizontal label text alignment | Start-aligned |
| Left/right padding | 16dp |
| Left/right padding with icon | 8dp |
| Padding between elements | 8dp |

### Filter chip
- Container
- Label text
- Leading icon
- Trailing icon

#### Filter chip color
Filter chip color roles used for light and dark themes:
- On surface variant
- On secondary container
- Secondary container
- Outline variant
- Surface container low (optional)

#### Filter chip states
Selected and unselected filter chip states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

#### Filter chip measurements
Filter chip padding and size measurements

| Attribute | Value |
| --- | --- |
| Container height | 32dp |
| Container shape | 8dp corner radius |
| Icon size | 18dp |
| Vertical label text alignment | Center-aligned |
| Horizontal label text alignment | Start-aligned |
| Left/right padding | 16dp |
| Left/right padding with icon | 8dp |
| Padding between elements | 8dp |

### Input chip
- Container
- Label text
- Trailing icon
- Leading icon

#### Input chip color
Input chip color roles used for light and dark themes:
- On surface variant
- Surface container low (optional)
- On surface variant
- Outline variant
- Primary
- Secondary container
- On secondary container

#### Input chip states
Selected and unselected input chip states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

#### Input chip measurements
Input chip padding and size measurements

| Attribute | Value |
| --- | --- |
| Container height | 32dp |
| Container shape | 8dp corner radius |
| Icon size | 18dp |
| Avatar shape | 12dp corner radius |
| Avatar size | 24dp |
| Vertical label text alignment | Center-aligned |
| Horizontal label text alignment | Start-aligned |
| Left padding for avatar | 4dp |
| Right padding for avatar | 8dp |
| Left/right padding for icon | 8dp |
| Padding between elements | 8dp |
| Target size for close icon | Min 48dp |

### Suggestion chip
- Container
- Label text

#### Suggestion chip color
Suggestion chip color roles used for light and dark themes:
- Outline
- Surface container low (optional)
- On surface variant

#### Suggestion chip states
Selected and unselected suggestion chip states:
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

#### Suggestion chip measurements
Suggestion chip padding and size measurements

| Attribute | Value |
| --- | --- |
| Container height | 32dp |
| Container shape | 8dp corner radius |
| Icon size | 18dp |
| Vertical label text alignment | Center-aligned |
| Horizontal label text alignment | Start-aligned |
| Left/right padding without icon | 16dp |
| Left/right padding with icon | 8dp |
| Padding between elements | 8dp |

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Use a chip to perform an action
- Navigate to a chip
- Activate a chip

### Interaction & style
The chip label needs at least 3:1 contrast with the background.
A chip that performs an action should present the same semantics as a button to a platform's accessibility API.
High contrast helps differentiate chips clustered together

#### Horizontal overflow
When there are too many chips to fit on one row, provide a way to display them all at once and avoid scrolling.
Reflow method: Use a filter chip as a leading element to reflow the horizontal list. This should shift down the content below and make room for all chips to show.
The Show all filter chip is used to reflow the list, displaying all chips at once and pushing down the content below
Menu method: Create a leading button to display all chip options in a menu. Use this option to avoid shifting the position of the content below.
Don’t use the menu method on chips with a second action, like a remove icon.
The Show all leading button shows a menu of chip options, keeping the place of content below

#### Avoid applying density by default
Don't apply density to chips by default — this lowers their targets below our best practice of 48x48 CSS pixels. Instead, give people a way to choose a higher density, like selecting a denser layout or changing the theme.
To ensure that this density setting can be easily reverted when it's active, keep all the targets to change it at minimum 48x48 CSS pixels each.

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Moves focus to enabled chip or chip group |
| Space or Enter | Activates, selects, or deselects the focused chip |
| Backspace or Delete | Removes currently focused input chip |
| Arrows | Moves focus between chips |

### Labeling elements

| Element | A11y label | Role (Web) | Role (Android Views (MDC-Android)) | Role (Jetpack Compose) |
| --- | --- | --- | --- | --- |
| Image / Icon within chip | Hide image | - | - | - |
| Basic chip (one action) | “{chip content}” | gridcell | button | button |
| Selectable chip | “{chip content}” | gridcell | radio button | checkbox |
| Remove icon (no other action) | “Remove {chip content}” | - | - | - |
| Two actions (e.g., select + remove) | “{chip content}.” Then “Remove {chip content}”. | button or checkbox | button or checkbox | button or checkbox |

The accessibility label for a chip is the chip's label text. Additional actions, like remove, are labeled separately.
Accessibility tags should include both the label and role

#### Multi-select
For multi-select chip sets, Space or Enter will select the focused chip and allow you to select all of the chips. Space or Enter will also deselect a focused selected chip.
While multiple chips can be selected, only one can be in focus

#### Drop-down list
The accessibility label should align with each list item’s text label.
For list items with text and an icon, the accessibility label should be marked as decorative to avoid redundant verbalizations.
The accessibility label should be the text label

#### Input chip remove action
Display the remove icon whenever a chip can be removed. On mobile, if remove is the only chip action, the remove icon isn't necessary. Instead the chip can be removed by selecting it and pressing the Delete key on the keyboard.
Each chip is a focusable element.
- If a chip only has a remove icon, the entire chip and icon are one focusable element.
- If a chip has a second action, like select, then the chip content and remove icon are two separate focusable elements.
The remove action is focused when the chip can also be selected

#### Showing chip interactivity
Material requires that chips use a secondary indicator to show that they are interactive in context, allowing users with low vision and cognitive disabilities to see them. Use one of the following methods:
- Add a label before the chip group suggesting interaction, such as Select type
Labels introducing a chip group can indicate that they are selectable
- Provide interactive page context, such as Filter results, indicating chips can be selected to narrow results
Page context can indicate how search results will be narrowed by selecting chips
- Use the outline color role, instead of outline variant, to ensure a minimum 3:1 contrast
- Include an interactive chip label, such as Turn on lights, or leading icon
Chips can show they are interactive with a darker outline color stroke
Chips can also use a leading icon or label to show interactivity
