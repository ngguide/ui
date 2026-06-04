# Dialogs — M3 spec reference

> **Source:** [Dialogs — Material Design 3](https://m3.material.io/components/dialogs) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/dialog` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use dialogs to make sure users act on information
- Two variants: basic and full-screen
- Should be dedicated to completing a single task
- Can also display information relevant to the task
- Commonly used to confirm high-risk actions like deleting progress
- Basic dialog
- Full-screen dialog

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Layout: Greater padding to account for the increased corner-radius and title size
- Position: Option for custom basic dialog positioning
- Shape: Increased corner-radius
- Typography: Larger and darker headline
New updates to color, layout, position, shape, and typography

## Specifications

### Basic dialogs
- Container
- Icon (optional)
- Headline (optional)
- Supporting text
- Divider (optional)
- Button label text
- Scrim

#### Basic dialog color
Basic dialog color roles used for light and dark themes:
- Surface container high
- Secondary
- On surface
- On surface variant
- Primary
- Scrim

#### Basic dialog measurements
Basic dialog padding and size measurements

| Attribute | Value |
| --- | --- |
| Container shape | 28dp corner radius |
| Container height | Dynamic |
| Container width | Min 280dp; Max 560dp |
| Divider height | 1dp |
| Icon size | 24dp |
| Minimum width | 280dp |
| Maximum width | 560dp |
| Alignment with icon | Center-aligned |
| Alignment without icon | Start-aligned |
| Top/Left/right/bottom padding | 24dp |
| Padding between buttons | 8dp |
| Padding between title and body | 16dp |
| Padding between icon and title | 16dp |
| Padding between body and actions | 24dp |

### Full-screen dialogs
- Container
- Header
- Icon (close affordance)
- Headline (optional)
- Text button
- Divider (optional)

#### Full-screen dialog color
Full-screen dialog color roles used for light and dark themes:
- Surface container high
- On surface
- Primary
- On surface variant

#### Full-screen dialog measurements
Full-screen dialog padding and size measurements

| Attribute | Value |
| --- | --- |
| Container shape | 0dp corner radius |
| Container height | Dynamic |
| Container width | Container width; Max 560dp |
| Header height | 56dp |
| Header width | Container width |
| Headline text alignment | Start-aligned |
| Divider height | 1dp |
| Icon (close affordance) size | 24dp |
| Bottom action bar height | 56dp |
| Bottom action bar width | Container width |
| Top/left/right padding | 24dp |
| Padding between elements | 8dp |

## Accessibility

### Use cases
People should be able to use assistive technology to:
- Open and close a dialog
- Provide and submit other inputs if the dialog is interactive, such as a text field or selectable list
- Scroll the dialog to access all of its contents if that content extends beyond the container of the dialog

### Interaction & style

#### Use sparingly
Dialogs are purposefully interruptive. This means they appear in front of app content and disrupt the flow of content for people who may, for example, be using a screen reader to navigate the page.
As such, dialogs should be used sparingly and only to provide critical information. Less critical information should be presented in a non-blocking way within the flow of app content.
Present non-critical information using other UI within the flow of app content
Avoid putting non-critical information in a dialog

#### 200% text size
Avoid excessive text wrapping or truncation by choosing concise strings.
On Android, headlines should be kept concise enough to fit within four lines after the text size is increased to 200%. If a headline exceeds this limit and gets truncated, provide an alternative way to access the full content in a single tap.
Avoid excessive text wrapping or truncation by choosing concise strings

#### Elements within dialogs
Because dialogs can contain various elements within them, refer to the relevant accessibility guidelines for each element. Some common examples include:
- Text fields
- Typography
- Buttons
Full-screen dialogs can contain various elements such as (1) text fields, (2) typography, and (3) buttons, which each may have their own accessibility guidelines

### Initial focus
When a dialog appears, focus should automatically land on the first interactive element within the dialog.
Initial focus lands on the first interactive element within a dialog. The tab key moves focus through the next interactive elements in a cycle.
The shift and tab keys together move focus in the opposite direction. The space or enter key triggers or commits the action of the focused element.

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on the next interactive element contained in the dialog, or the first element if focus is currently on the last element |
| Shift + Tab | Focus lands on the previous interactive element contained in the dialog, or the last element if focus is currently on the first element |
| Space or Enter | Triggers or commits the action of the focused element |
| Escape | Closes the dialog |

### Labeling elements
The accessibility label for a dialog is typically the same as the dialog’s title or headline.
On web, basic dialogs should have the alert dialog role.
Basic dialogs are known as alert dialogs on web
Components contained within the dialog, such as buttons, should be labeled according to the guidelines specific to those components.
For common examples, see:
- Buttons
- Text fields
Elements within a dialog should be labeled according to their guidelines
