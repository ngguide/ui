# Time pickers — M3 spec reference

> **Source:** [Time pickers — Material Design 3](https://m3.material.io/components/time-pickers) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/time-picker` · **Group:** text-inputs
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Time pickers are modal and cover the main content
- Two variants: dial and input
- People can select hours, minutes, or periods of time
- Make sure time can easily be selected by hand on a mobile device
- Time picker dial
- Time picker input

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
M2: Time pickers had different color mappings
M3: Time pickers have new color mappings compatible with dynamic color

## Specifications

### Anatomy

#### Time picker dial
- Headline
- Time selector separator
- Container
- Period selector container
- Period selector label text
- Clock dial selector center
- Clock dial selector track
- Text button
- Icon button
- Clock dial selector container
- Clock dial label text
- Clock dial container
- Time selector label text
- Time selector container

#### Time picker input
- Headline
- Time input field seperator
- Container
- Period selector container
- Period selector label text
- Text button
- Icon button
- Time input field supporting text
- Time input field label text
- Time input field container

### Color

#### Time picker dial color
Time picker dial color roles used for light and dark themes, mapped to each anatomy element/state:
- Headline — On surface variant
- Time selector label text — On surface
- Time selector container — Surface container highest
- Time selector label text (on container) — On surface
- Period selector container (selected) — Tertiary container
- Period selector label text (selected) — On tertiary container
- Container (surface) — Surface container high
- Period selector container (outline) — Outline
- Period selector label text (unselected) — On surface
- Clock dial selector center / track / handle — Primary
- Clock dial label text (selected number) — On primary
- Time selector separator — Primary
- Clock dial label text (unselected, decorative) — On surface variant
- Clock dial label text — On surface
- Clock dial container — Surface container highest
- Period selector label text (input variant, selected) — On primary container
- Period selector container (input variant, selected) — Primary container

#### Time picker input color
Time picker input color roles used for light and dark themes, mapped to each anatomy element/state:
- Headline — On surface variant
- Time input field label text — On surface
- Time input field container — Surface container highest
- Time input field label text (on container) — On surface
- Period selector container (selected) — Tertiary container
- Period selector label text (selected) — On tertiary container
- Container (surface) — Surface container high
- Period selector container (outline) — Outline
- Period selector label text (unselected) — On surface
- Time input field container (active outline) — Primary
- Time input field supporting text — On surface variant
- Period selector label text (selected, Primary container) — On primary container
- Period selector container (selected, Primary container) — Primary container

### States
- Enabled
- Hover
- Focus
- Pressed
States specs can be found in the token module above

### Measurements

#### Time picker dial - vertical
Vertical time picker dial padding and size measurements

| Element | Attribute | Value |
| --- | --- | --- |
| Container | Width | Dynamic |
| Height | Dynamic |
| Headline alignment | Left |
| Top/bottom padding | 24dp |
| Left/right padding | 24dp |
| Time selector container | Width | 96dp |
| Width (24h vertical) | 114dp |
| Height | 80dp |
| Period selector container | Width (vertical layout) | 52dp |
| Height (vertical layout) | 80dp |
| Width (horizontal layout) | 216dp |
| Height (horizontal layout) | 38dp |
| Clock dial container | Size | 256dp |
| Clock dial selector handle | Size | 48dp |
| Clock dial selector center | Size | 8dp |
| Clock dial selector track | Width | 2dp |

#### Time picker dial - horizontal
Horizontal time picker dial padding and size measurements

| Element | Attribute | Value |
| --- | --- | --- |
| Container | Width | Dynamic |
| Height | Dynamic |
| Headline alignment | Left |
| Top/bottom padding | 24dp |
| Left/right padding | 24dp |
| Time selector container | Width | 96dp |
| Width (24h vertical) | 114dp |
| Height | 80dp |
| Period selector container | Width (vertical layout) | 52dp |
| Height (vertical layout) | 80dp |
| Width (horizontal layout) | 216dp |
| Height (horizontal layout) | 38dp |
| Clock dial container | Size | 256dp |
| Clock dial selector handle | Size | 48dp |
| Clock dial selector center | Size | 8dp |
| Clock dial selector track | Width | 2dp |

#### Time picker input
Time picker input padding and size measurements

| Element | Attribute | Value |
| --- | --- | --- |
| Container | Width | Dynamic |
| Height | Dynamic |
| Headline alignment | Left |
| Top/bottom padding | 24dp |
| Left/right padding | 24dp |
| Time input field container | Width | 96dp |
| Height | 72dp |
| Period selector container | Width | 52dp |
| Height | 72dp |

### Configurations

#### Vertical orientation and horizontal orientation
- Vertical layout (default on mobile)
- Horizontal layout

#### 24-hour time picker dial
- 24h dial in vertical layout (default on mobile)
- 24h dial in horizontal layout

#### 12-hour and 24-hour time picker inputs
- 12h input
- 24h input

## Accessibility

### Use cases
People should be able to use assistive technology to:
- Select or enter hours/minutes, and in some cases, seconds/milliseconds
- Choose from multiple time formats, including 24-hour clock view and AM/PM
- Enter time selection manually using input fields

### Interaction & style
Time pickers should allow manual time entry through text input, rather than exclusively through the dial selector. This makes it easier for those using keyboard inputs rather than touchscreens.
If a screen is not large enough to display the dial selector, consider displaying the input selector alone. Currently for Android Views, the dial selector is always visible.
The input selector should be accessible from the dial selector via the keyboard icon. This interaction allows multiple input methods and makes the time picker accessible for assistive technology users.
For time selection that doesn’t require a dial view, make a time input picker the default option

#### Targets
Targets for dial selectors should be 48x48dp.
Dial selector targets should be 48x48dp

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on (non-disabled) time slot |
| Space or Enter | Activates the (non-disabled) time slot |

### Labeling elements
If the input text is correctly linked, assistive tech like a screenreader will read the component’s role first, then the UI text.
The hour and minute fields have the text input role
The dial selector will read a selection of total hours, such as Hour 7 of 12.
A screen reader reads the text label of a dial selector

#### Dial selector

| Element | Accessibility label | Role (Wiz and Jetpack Compose) | Role (Android Views) |
| --- | --- | --- | --- |
| Hour input (input picker) | Hour | Text input | - |
| Minutes input | Minute | Text input | - |
| AM/PM selection | AM or PM | Radio button (in list) | Checkbox (in list) |
| Keyboard button | Toggle input picker | Button | Button |
| Cancel button | Cancel | Button | Button |
| OK button | OK | Button | Button |
| Clock dial time selection (dial selector) | {Value} Hours or minutes of {Total} | Button | - |

#### Input selector

| Element | Accessibility label | Role (Wiz and Jetpack Compose) | Role (Android Views) |
| --- | --- | --- | --- |
| Hour input (input picker) | Hour | Text input | - |
| Minutes input | Minute | Text input | - |
| Clock button | Toggle dial picker | Button | Button |
| Cancel button | Cancel | Button | Button |
| OK button | OK | Button | Button |
