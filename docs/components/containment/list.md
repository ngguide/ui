# Lists — M3 spec reference

> **Source:** [Lists — Material Design 3](https://m3.material.io/components/lists) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/list` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use lists to help people find a specific item and act on it
- Order list items in logical ways, like alphabetical or numerical
- Keep items short and easy to scan
- Show icons, text, and actions in a consistent format
- Choose between standard and segmented styles
A list item's label text, supporting text, image, and trailing icon can be customized to create a variety of lists

### M3 Expressive update
Lists have a new segmented visual style, improved selection treatment, and support for slots. More on M3 Expressive
December 2025
Variants:
- Added expressive list Recommended for new designs
- List ( baseline) is still available
New visual styles:
- Standard or segmented
- Highlighted selection states
- Flexible slots
Supported platforms:
- Android Views (MDC-Android)
- Jetpack Compose
Expressive lists feature improved selection states

### Differences from M2 to M3 baseline
- Color: New color mappings and compatibility with dynamic color
- Layout: Padding and spacing rules are updated to be more consistent
- Height: The tallest element within a list item determines the list item’s height - either 56dp, 72dp, or 88dp
- Alignment: In most cases, elements in a list item are middle-aligned If a list is 88dp or larger, or contains three or more lines of text, elements are top-aligned
M2: Non-standard heights and alignments
M3 (baseline): Standardized heights and alignments

## Specifications

### Variants

#### Expressive lists
Use the expressive list variant for more flexible styling, highlighted selection states, and customizable slots.
An expressive list has a segmented style and round corners

#### Baseline lists
In M3 Expressive, baseline lists are still available to use, but don’t have the latest visual style, selection treatment, and slot functionality.
See baseline list specs
Baseline list items have square corners and standard colors

| Variants | M3 | M3 Expressive |
| --- | --- | --- |
| List (expressive) | -- | Available |
| List (baseline) | Available | Available |

### Configurations

#### Styles
The standard and segmented styles are a visual choice, and don’t affect a list’s behavior.
- Standard
- Segmented

#### List selection modes
A list can have only one selection mode at a time. For example, a single-action list can change to a multi-select list, but can’t be both at once.
In a single-action list, each item is a single tappable area
Multi-action list items include a primary action and one or more secondary actions
A single-select list
A multi-select list

#### List interactions

##### Expand
On Android, lists can expand and collapse.
A list can expand to include multiple items

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Styles | Standard | Available | Available |
| Segmented | -- | Available |
| Selection modes | Single-action, multi-action, single-select, multi-select | Available | Available |
| Interactions | Expand | Available | Available |

### Anatomy
Container and label text are required. All other elements are optional:
- Container
- Overline
- Label text
- Trailing text
- Supporting text
- Trailing icon
- Divider
- Leading avatar
- Leading icon
- Leading media - image or video

#### Flexibility & slots
The M3 Design Kit includes lists with custom slots for designing flexible item layouts. Think of a custom list as a container with three different slots: leading, content, and trailing. Each slot can hold a different element.

##### Slot accessibility
Slots are not accessible by default. Consider the following:
- Elements must follow the rules, structure, and interaction patterns for lists
- Use standard list item padding
- Target size must be at least 48x48dp
- Don't add interactive elements that make the list item difficult to navigate, especially for people using screen readers
More on required accessibility guidelines
Reserve the use of slots for use cases that maintain the list’s accessibility and functionality
- Leading slot
- Content slot
- Trailing slot
Caution:
Slots require custom code implementation that you must create and maintain
The leading and trailing slot positions must be a smaller width than the content section.
1. Leading slots can contain:
- Visual elements: Avatar, icon, image, or video thumbnail
- Selection controls: Checkbox, radio button, or switch
- Customizations: Badge or larger image
2. Content slots must be the largest-width slot and can contain:
- Default content: Label text, supporting text
- Optional add-ons: Badge, icon, in-line label, or more text elements
- Avoid long lines of text to preserve readability
3. Trailing slots can contain:
- Action elements or text: Icon, icon button, or trailing text
- Selection controls: Checkbox, radio button, or switch
The content slot must be the largest section, placed in the middle of the list item

##### Selection lists
For selection lists, use only one selection interaction per list item.
Use only one selection interaction per list item
Don't use multiple selection interactions in one item

### Color
List color roles used for light and dark themes:
- Surface
- On surface variant
- On surface
- On surface variant
- Outline variant
- Primary container
- On primary container
- On surface variant

### States

#### Default list items
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

#### Selected list items
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Dragged

### Measurements
List item alignment, padding, and size measurements. The icon button height is dynamic, and automatically adjusts to fill the list item height.

### List (baseline)
The baseline list variant is available and continues to work in existing products. However, the expressive list variant is recommended for new designs.

#### Color
List color roles used for light and dark themes:
- Surface
- On surface
- On surface variant
- Outline variant
- Primary container
- On primary container
- On surface variant

#### States
1. Enabled
2. Disabled
3. Hovered
4. Focused
5. Pressed
6. Dragged

#### Layout

##### One-line lists
Baseline one-line list alignment, padding, and size measurements
Baseline list item measurements and padding

##### Two-line lists
Baseline two-line list alignment, padding, and size measurements
Baseline list item measurements and padding

##### Three-line lists
Baseline three-line list alignment, padding, and size measurements
Baseline list item measurements and padding

| Attribute | Value |
| --- | --- |
| Label alignment | Center |
| Label alignment when height is 88dp or taller | Top |
| Label left padding | 16dp |
| Leading element alignment (vertical) | Center |
| Leading element alignment (vertical) when height is 88dp or taller | Top |
| Leading element left padding | 16dp |
| Leading icon alignment (vertical) | Top |
| Leading icon top padding | 8dp |
| Leading icon top padding when height is 88dp or taller | 12dp |
| Trailing element alignment (vertical) | Center |
| Trailing element alignment (vertical) when height is 88dp or taller | Top |
| Trailing element left padding | 16dp |
| Trailing element right padding | 24dp |
| Padding above/below divider | 0dp |
| Targets | 48dp |
| Divider full-width | 100% |
| Divider inset left padding | 16dp |
| Divider inset right padding | 24dp |

#### Configurations

##### Leading avatar
- With leading avatar
- With leading avatar and trailing checkbox

##### Leading image or thumbnail
- With leading image
- With leading image and trailing checkbox

##### Leading video
- With leading video
- With leading video and trailing checkbox

##### Leading icon
- With leading icon
- With leading icon and trailing checkbox

##### Text-only
- With text only
- With text and trailing checkbox

##### Leading checkbox
- With leading checkbox
- With leading checkbox and trailing text

##### Leading radio button
- With leading radio button
- With leading radio button and trailing text

##### Trailing switch
- With trailing switch
- With leading icon and trailing switch

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Navigate to a list item
- Select a list item

### Indicate selection with more than color
To make selected items clear for everyone, don't rely on color as the only visual cue.
Use an additional indicator that an item is selected such as:
- Radio buttons or checkboxes
- Leading or trailing icons
- A visual style not related to color, like underlined text
Use two visual cues to show a list item is selected, like a leading checkmark and filled color

### Interaction & style

#### Touch
When a person taps on a list item, a touch ripple appears, indicating interaction feedback.
A ripple appears when a person taps on a list item to select it

#### Cursor
When hovered, the hover state provides a visual cue that a list item is interactive.
Cursor: Hover
Cursor: Selected

#### Keyboard & switch
When a person tabs to a single-action list, a focus indicator appears, providing a visual cue that the first list item is now focused and action can be taken.
When a person interacts with the focused list item via Space or Enter, the action is performed.
Tab key navigates to the list. Space or Enter keys activate items.

### Focus

#### Single-action lists
The first element in a list should always receive focus, unless the list has a selected element. In that case, focus should go to the selected list item instead. After an element is focused, a person should be able to navigate within the list using arrow keys.
Tab key focuses on the first item or the selected item
Arrow keys navigate up and down through list items
All list items must be able to be activated using the Space or Enter key. More on single-action lists
Space or Enter keys activate an element in a list

#### Multi-action lists
Multi-action list items contain a primary action and at least one supplementary action. The list item as a whole isn't selectable; only the individual actions are.
A person should be able to use a keyboard to:
- Tab to the list item, which focuses the first element
- Move between between all focusable elements in the list using the Up, Down, Left, and Right arrow keys
- Activate a focused element using Space or Enter
More on multi-action lists
Tab brings the focus to the first action
Down and Right arrow keys move focus to the next action of the list item, or to the first action in the next item
Up and Left arrow keys move focus to the previous action of the list item
If the focus is on a list item’s first action, the Up and Left arrows move focus back to the last action of the previous item
The Space or Enter key activates a selected action in a list

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | To move focus to the first list item, last list item, or outside of the list component |
| Down and right arrow keys | Moves to the next element in the list; if the focused element is the last in the list, it wraps back to the top of the list |
| Up and left arrow keys | Moves to the previous element in the list; if the focused element is the first in the list, it wraps back to the bottom of the list |
| Space or Enter | To select a list item not yet selected |

### Labeling elements
Accessibility labels are used with assistive devices like screen readers.
The accessibility label for a list item is typically the same as the label text and supporting text.
Some labels, roles, and states are dependent on platform.
A list item’s label text and supporting text is used for its accessibility label

#### Platform-specific labels

##### Single-select lists

| Trait | Web | Android Views (MDC-Android) | Jetpack Compose |
| --- | --- | --- | --- |
| Aria label | Container label: Should describe selection type List item: Should match the visible label text | List item: Should match the visible label text | List item: Should match the visible label text |
| Role | Container: List box List item: Option | List item: Radio button | List item: Radio button |
| State | Selected or Not-selected | Checked or Not-checked | Checked or Not-checked |

##### Multi-select lists

| Trait | Web | Android Views (MDC-Android) | Jetpack Compose |
| --- | --- | --- | --- |
| Aria label | Container label: Should describe selection type List item: Should match the visible label text | List item: Should match the visible label text | List item: Should match the visible label text |
| Role | Container: List box List item: Option | List item: Checkbox | List item: Checkbox |
| State | Selected or Not-selected | Checked or Not-checked | Checked or Not-checked |

On web, a list container’s accessibility label describes the type of selection that can be made, and the role is List box.
On web, a list container’s role is List box
On Jetpack Compose, the role applies to the list item as a whole.
If a list isn't selectable, the label text is read out without a role.
When selectable, the role Checkbox applies to the entire list item on Jetpack Compose
On Android Views (MDC-Android), components contained within the list should be labeled according to that component’s specific guidelines:
- Checkbox
- Radio button
On Android Views (MDC-Android), the accessibility label and role are applied to the interactive component by default
