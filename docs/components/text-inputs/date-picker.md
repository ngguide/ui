# Date pickers — M3 spec reference

> **Source:** [Date pickers — Material Design 3](https://m3.material.io/components/date-pickers) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/date-picker` · **Group:** text-inputs
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Date pickers can display past, present, or future dates
- Three variants: docked, modal, modal input
- Clearly indicate important dates, such as current and selected days
- Follow common patterns, like a calendar view
- Docked date picker
- Modal date picker
- Modal date input

### Differences from M2
- Typography and spacing: Titles and labels are larger and have increased spacing to accommodate 48dp target size
- Color: New color mappings and compatibility with dynamic color
- Variants: The three variants of date pickers have been renamed to not be device-dependent. The former desktop date picker is now known as the docked date picker. The former mobile date picker and date input are now known as modal date picker and modal date input to reinforce that the user must take an action.
M2: Date pickers had a drop shadow and different color mappings
M3: Date pickers have larger typography, no shadow, and new color mappings compatible with dynamic color

## Specifications

### Docked date picker
- Outlined text field
- Menu button: Month selection
- Menu button: Year selection
- Icon button
- Weekdays label text
- Unselected date
- Today’s date
- Outside month date
- Text buttons
- Selected date
- Container
- Outlined text field
- Menu button: Month selection (pressed)
- Menu button: Year selection (disabled)
- Header
- Menu
- Selected list item
- Unselected menu list item
- Container

#### Docked date picker color
Docked date picker color roles used for light and dark themes:
- Primary
- On surface variant
- On surface
- Primary
- On surface variant
- Primary
- Surface container high
- Primary
- On primary
Docked date picker menu color roles used for light and dark themes:
- Primary
- On surface variant
- On surface
- Outline variant
- Surface container high
- Surface variant
- On surface

#### Docked date picker measurements
Docked date picker padding and size measurements
Docked date picker month menu padding and size measurements

#### Docked date picker configurations
- Day selection
- Month selection
- Year selection

### Modal date picker
- Headline
- Supporting text
- Header
- Container
- Icon button
- Icon buttons
- Weekdays
- Today’s date
- Unselected date
- Text buttons
- Selected date
- Menu button
- Divider
- Headline
- Supporting text
- Header
- Container
- Icon button
- Unselected year
- Selected year
- Text buttons
- Divider
- Menu button
- Headline
- Supporting text
- Icon button
- Header
- Text button
- Icon button
- Weekdays label text
- Container
- Today’s date
- Unselected date
- In-range active indicator
- In-range date
- Month subhead
- Selected date
- Divider

#### Modal date picker color
Modal date picker color roles used for light and dark themes in a day selection menu:
- On surface
- On surface variant
- Surface container high
- On surface variant
- On surface
- Primary
- On surface
- Primary
- On surface variant
- Outline variant
Modal date picker color roles used for light and dark themes in a year selection menu:
- On surface
- On surface variant
- Surface container high
- On surface variant
- Primary
- Outline variant
- On surface variant
Modal date picker range selector color roles used for light and dark themes:
- On surface
- On surface variant
- Surface container high
- Primary
- On surface variant
- On surface
- Primary
- On surface
- Secondary container
- On secondary container
- Outline variant
- On surface variant
- Primary

#### Modal date picker measurements
Modal date picker padding and size measurements
Modal date picker year selector padding and size measurements
Modal date picker date range selector padding and size measurements

#### Modal date picker configurations
- Single date selection
- Date range selection
- Year selection

### Modal date input
- Headline
- Supporting text
- Header
- Container
- Icon button
- Outlined text field
- Text buttons
- Divider

#### Modal date input color
Modal date input color roles used for light and dark themes:
- On surface
- On surface variant
- Surface container high
- On surface variant
- Primary
- Outline variant

#### Modal date input measurements
Modal date input padding and size measurements

#### Modal date input configurations
- Single date input
- Date range input

### Element states
States for date and year selection:
- Default (enabled)
- Disabled
- Hovered
- Focused
- Pressed (ripple)

## Accessibility

### Use cases
People should be able to:
- Enter dates manually by inputting text, without using the picker
- Use multiple input methods, making it accessible to those using assistive technology
On the docked date picker, the text field can be used for input. On the modal date picker, the date input option should be available using the edit icon.

### Interaction & style
The edit icon indicates the ability to switch to the modal date input. Interactive targets for all elements meet Material's 48x48dp minimum touch target requirement. Increasing density would negatively impact accessibility by limiting tappable/clickable targets.
The edit icon indicates the ability to switch to the modal date input
Touch targets are 48x48dp

### Date entry methods
The date entry component offers two ways to enter a date:
- Direct text entry into a text field
- Through the date picker
The calendar icon is the exclusive entry point for the date picker. This improves efficiency for a screen reader and other keyboard users, as it makes interaction with the date picker optional and reduces the amount of key presses required to input a date. Each input is a separate tab stop, which improves discoverability of the control.
Entering a date either through direct text entry or the date picker

### Accessible date input
Automatically format the date after the user hits “Enter“ or navigates out of the text field. Don't automatically format the date by adding slashes or other special characters while the user is typing (also known as input masks). This can cause confusion for people using screen readers because it changes what they typed.
To reduce errors, accept a range of formats including dashes, spaces, slashes, dots, and 0 to the left of a single digit month/day. This is especially helpful for assistive technology users who might be more prone to errors when interacting with complex inputs.
The text field's logic can adapt to the user's actual input format, applying the correct formatting after the user has completed their text entry

### Optional Clear button
If it's not needed for your use case, remove the Clear button from the screen to reduce the number of tab stops for keyboard users.
Remove non-critical actions to reduce the number of tab stops for keyboard users

### Affordance for keyboard shortcuts
Ensure keyboard shortcuts are readily available for keyboard and screen reader users by providing the shortcut key in the tooltip. It should be included in the hint description to be read out by the screen reader. As shown here, the previous year button is interactive and can therefore be focused via the keyboard. Upon focus, the tooltip explains the behavior of the button and shows the shortcut key.
Keyboard tooltip example for date picker

### Truncated labels & tooltips
Truncating labels isn't ideal, but tooltips allow the full text to be shown on hover or keyboard focus. Days of the week are not interactive and are therefore not focusable via keyboard, yet the tooltip is available on hover. The date picker relies on the conventionality of these abbreviations for some assistive technology users.
Days of the week are not navigable via keyboard, so the tooltip is shown only on pointer hover

### Color contrast between dates
Dates should have contrast of at least 4.5:1 between the link text colors and the background.
Dates pass the 4.5:1 contrast minimum

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Enter/return | Enter/return |
| Enter/return | Closes the calendar and saves the selected date |
| Page up/down | Move to the same date on next/previous month |
| Home/End | Move to the first/last day of the week |
| Shift + Page up/down | Moves to the same date in the next/previous year |
| Shift + M | Moves to the month list dropdown |
| Shift + Y | Moves to the year list dropdown |

### Labeling elements
The text field's accessibility label should clearly state the purpose of the input (for example, event date or reservation date) and should match the placeholder text when the field is empty. The helper text (below the text field) should specify the date format (for example, MM/DD/YYYY or YYYY/MM/DD) and act as a description for the text field. The default helper text is "MM/DD/YYYY," but this can be customized.
The accessibility label clearly states the kind of input as an event date

| Element | A11y label | Role |
| --- | --- | --- |
| Previous / next month and year | “{label}” | Button |
| Month and year dropdowns | “{label}” | Button |
| Days of the week | Column header |  |
| Month grid | Grid |  |

### Screen reader verbalizations
To support screen reader users, labels are used to enumerate the complete date. This allows screen reader users to hear the full context of "Monday, August 17” instead of just part of the date.
Screen readers will state the full day, month, date, and year instead of just the number 17
