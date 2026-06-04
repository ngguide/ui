# Cards — M3 spec reference

> **Source:** [Cards — Material Design 3](https://m3.material.io/components/cards) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/card` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use cards to contain related elements
- Three variants: elevated, filled, outlined
- Contents can include anything from images to headlines, supporting text, buttons, and lists
- Can also contain other components
- Cards have flexible layouts and dimensions based on their contents
- Elevated card
- Filled card
- Outlined card

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Elevation: Lower elevation and no shadow by default
- Variants: Three official card variants – elevated, filled, and outlined
Cards have updated colors, elevation, and variants

## Specifications

### Elevated card
- Container

#### Elevated card color
Elevated card color roles used for light and dark themes:
- Surface container low

#### Elevated card states
Elevated card states:
- Hovered
- Focused
- Pressed
- Dragged
- Disabled

### Filled card
- Container

#### Filled card color
Filled card color roles used for light and dark themes:
- Surface container highest

#### Filled card states
Filled card states:
- Hovered
- Focused
- Pressed
- Dragged
- Disabled

### Outlined card
- Container
- Outline

#### Outlined card color
Outlined card color roles used for light and dark themes:
- Surface
- Outline variant

#### Outlined card states
Outlined card states:
- Hovered
- Focused
- Pressed
- Dragged
- Disabled

### Measurements
Card padding and size measurements

| Attribute | Value |
| --- | --- |
| Shape | 12dp corner radius |
| Left/right padding | 16dp |
| Padding between cards | 8dp max |
| Label text alignment | Start-aligned |

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate to a card and the elements within a card
- Get appropriate feedback based on input type documented under Interaction & style

### Interaction & style
A card can be a non-actionable container that holds actions like buttons and links, or it can be directly actionable without any buttons or links. This is to avoid stacking actionable elements. An action shouldn’t be placed on an actionable surface.
- Non-actionable card with buttons
- Directly actionable card with no buttons

#### Touch
When a user taps on a directly actionable card, a touch ripple appears across the card, indicating feedback.
Non-actionable cards don’t ripple.
Touch: Tap

#### Dragging and dismissing
To meet Material's accessibility standards, any dragging and swiping interactions need a single-pointer alternative, like selecting the same actions from a menu. For example, tapping a card, or pressing and holding, should open a menu to change its position in a list. That menu could also contain an action to delete the card.
Use containers like bottom sheets or menus to show single-pointer options
It isn’t recommended to place menus on top of the card on the draggable state. If doing so is necessary, ensure that the interaction can be completed.
Ensure that the menu doesn't cover the card

#### Cursor
When a directly actionable card is hovered, the hover state provides a visual cue to the person that the element is interactive. Non-actionable cards don’t have a hover state.
When a directly actionable card is clicked, a ripple appears, providing feedback.
Cursor: Hover, Click

#### Keyboard
A focus indicator appears around actionable elements when tabbing through cards. This provides a visual cue to a person that the destination is now focused and an action can be taken.
A person can Tab to navigate between actionable elements of the cards. If the cards are non-actionable, Tab navigates directly to the actionable buttons or links within the cards.
When engaging with a focused actionable card or element using the Space or Enter key, an action is performed or a secondary action is available, such as a menu.
Within the menu, a person is able to Arrow through the menu items, Space or Enter to select an item, or Tab to exit.
Keyboard: Tab, Arrows

### Focus
All interactive elements of cards need a tab stop so they can be focused. Directly actionable cards are tab stops.
For non-actionable cards, the card itself is not a tab stop. However, every actionable element in the card is a tab stop so they’re all visited before focus navigates to the next card.
Use Tab to navigate through all buttons in a card
Card layouts can change on different devices

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Move to the next actionable element Directly actionable cards: Move to next card container Non-actionable cards with actionable elements: Move to next actionable element |
| Space or Enter | Confirm action |

### Labeling elements
The informative contents of a card are verbalized when navigating to them using a screen reader. If an image in a card is purely decorative, hide it from screen readers. All actionable elements must receive both screen reader and keyboard focus.
Directly actionable cards can have the button or link role, depending on how they’re used.
Non-actionable cards are purely containers, so they don’t need a role.
Non-actionable card elements are navigable, focused in order, and verbalized when in focus. In this example, the order is:
- Heading
- Image
- Body text
- Primary button
- Secondary button
