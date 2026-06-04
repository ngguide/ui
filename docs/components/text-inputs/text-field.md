# Text fields — M3 spec reference

> **Source:** [Text fields — Material Design 3](https://m3.material.io/components/text-fields) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/text-field` · **Group:** text-inputs
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Make sure text fields look interactive
- Two variants: filled and outlined
- The text field’s state (blank, with input, error, etc) should be visible at a glance
- Keep labels and error messages brief and easy to act on
- Text fields commonly appear in forms and dialogs
- Filled text field
- Outlined text field

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
Text fields have new color mappings

## Specifications

### Filled text field
- Container
- Leading icon (optional)
- Label text in empty field
- Label text in populated field
- Trailing icon (optional)
- Focused active Indicator
- Caret
- Input text
- Supporting text (optional)
- Enabled active indicator

#### Filled text field color
Filled text field color roles used for light and dark schemes:
- Surface container highest
- On surface variant
- Primary
- On surface variant
- Primary
- On surface
- On surface variant
- On surface

#### Filled text field states
- Enabled (empty)
- Focused (empty)
- Hovered (empty)
- Disabled (empty)
- Enabled (populated)
- Focused (populated)
- Hovered (populated)
- Disabled (populated)

#### Filled text field error states
Error states are visual representations used to communicate the status of a component or interactive element. An error message can display instructions on how to fix it. Error messages are displayed below the text field as supporting text until fixed.
- Enabled (empty)
- Focused (empty)
- Hovered (empty)
- Enabled (populated)
- Focused (populated)
- Hovered (populated)

#### Filled text field measurements
Padding and size measurements without icons
Padding and size measurements with icons
Padding and size measurements with supporting text and character count

| Attribute | Value |
| --- | --- |
| Default container height | 56dp |
| Label alignment (unpopulated) | Vertically centered |
| Top/bottom padding | 8dp |
| Left/right padding without icons | 16dp |
| Left/right padding with icons | 12dp |
| Icon alignment | Vertically centered |
| Padding between icons and text | 16dp |
| Supporting text and character counter top padding | 4dp |
| Padding between supporting text and character counter | 16dp |
| Target size | 56dp |

#### Filled text field configurations
Empty and populated filled text fields with:
- Supporting text
- Trailing icon
- Leading icon
- Leading and trailing icons
- Prefix
- Suffix
- Multi-line text field

### Outlined text field
- Enabled container outline
- Leading icon (optional)
- Label text in empty field
- Label text in populated field
- Trailing icon (optional)
- Focused container outline
- Caret
- Input text
- Supporting text (optional)

#### Outlined text field color
Outlined text field color roles used for light and dark schemes:
- Outline
- On surface variant
- Primary
- On surface variant
- Primary
- On surface
- On surface variant

#### Outlined text field states
- Enabled (empty)
- Focused (empty)
- Hovered (empty)
- Disabled (empty)
- Enabled (populated)
- Focused (populated)
- Hovered (populated)
- Disabled (populated)

#### Outlined text field error states
Error states are visual representations used to communicate the status of a component or interactive element. An error message can display instructions on how to fix it. Error messages are displayed below the text field as supporting text until fixed.
- Enabled (empty)
- Focused (empty)
- Hovered (empty)
- Enabled (populated)
- Focused (populated)
- Hovered (populated)

#### Outlined text field measurements
Padding and size measurements without icons
Padding and size measurements with icons
Padding and size measurements with supporting text and character count

| Attribute | Value |
| --- | --- |
| Container height | 56dp |
| Left/right padding without icons | 16dp |
| Left/right padding with icons | 12dp |
| Padding between icons and text | 16dp |
| Icon alignment | Vertically centered |
| Supporting text and character counter top padding | 4dp |
| Padding between supporting text and character counter | 16dp |
| Label alignment | Vertically centered |
| Left/right padding populated label text | 4dp |
| Target size | 56dp |

#### Outlined text field configurations
Empty and populated outlined text fields with:
- Supporting text
- Trailing icon
- Leading icon
- Leading and trailing icons
- Prefix
- Suffix
- Multi-line text field

## Accessibility

### Use cases
User should be able to:
- Navigate to and activate a text field with assistive technology
- Input information into the text field
- Receive and understand supporting text and error messages
- Navigate to and select interactive icons

### Interaction & style
The containers for both filled and outlined text fields provide the same functionality. Changes to color and thickness of stroke help provide clear visual cues for interaction.
Filled text fields
Outlined text fields
Containers improve the discoverability of text fields by creating contrast between the text field and surrounding content. In some contexts, outlined text fields can improve the perception of the fields with a 3:1 or greater contrast ratio between the container outline and the background.
Make sure the container outline has a minimum contrast of 3:1 to the background
Don't choose colors that won't pass Material's minimum contrast of 3:1

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on (non-disabled) text field |

### Labeling elements
If the UI text is correctly linked, assistive tech (such as a screenreader) will read the UI text followed by the component’s role. The accessibility label for a text field is the same as the text field label.
A text field’s label should include its UI text
For text fields with interactive trailing icons, the accessibility label clarifies its function.
For example, when a password is hidden, the label for the view icon is "Show password," and when the password is visible, the label is "Hide password." When an icon has no actionable role, like an error icon, the label is "Error."
When a trailing icon in the field acts as a button, the label should clarify function, while the role explains the component type
The prefix and suffix of a text field provides symbols and abbreviations to help users enter the correct values. The accessibility label for prefix and suffix needs to have a unique id attribute, for example, the currency name for a currency symbol prefix.
A form containing fields with both a prefix for currency, and a suffix for email address
When there is an error, "alert" is applied to the role and the error message to the text label.
If a text field displays both supporting text and error text, the label should include the supporting text first, followed by the error text.
Text field error messages should be given an “alert” role in accessibility labels
The accessibility label for the character counter clarifies the number of characters that can be entered into the text field.
The remaining character counter should be called “character count” within the label
The text displayed in the supporting text is also used for its accessibility label.
Text field supporting text should have its own accessibility label
If a text field requires input, indicate so with an asterisk at the end of the text field label. The accessibility label must include the asterisk.
A required text field’s accessibility label should include any supporting text
