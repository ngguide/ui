# FAB menu — M3 spec reference

> **Source:** [FAB menu — Material Design 3](https://m3.material.io/components/fab-menu) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/fab-menu` · **Group:** actions
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Opens from a FAB to show 2–6 related actions floating on screen
- One FAB menu size for all sizes of FABs
- Not used with extended FABs
- Available in primary, secondary, and tertiary color sets
The FAB menu comes in three color sets: primary, secondary, tertiary

### M3 Expressive update
May 2025
The FAB menu adds more options to the FAB. It should replace the speed dial and any usage of stacked small FABs. More on M3 Expressive
New component added to catalog:
- One menu size that pairs with any FAB
- Replaces any usage of stacked small FABs
Color:
- Contrasting close button and item colors
- Supports dynamic color
- Compatible with any FAB color style
The FAB menu uses contrasting color and large items to focus attention. It can open from any size FAB.

### Differences from M2
M2: The speed dial used small round FABs
M3: The FAB menu uses dynamic color and a larger item size

## Specifications

### Variants
There’s one variant of FAB menu

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| FAB menu | -- | Available |

### Configurations
Three color sets:
- Primary
- Secondary
- Tertiary

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Color | Primary set, secondary set, tertiary set | -- | Available |

### Anatomy
- Close button
- Menu item
The FAB menu can have up to six items

### Color
- On primary container
- Primary container
- On primary
- Primary
- On secondary container
- Secondary container
- On secondary
- Secondary
- On tertiary container
- Tertiary container
- On tertiary
- Tertiary

### States

#### Close button
Close button states in light and dark themes:
- Enabled
- Hovered
- Focused
- Pressed

#### Menu item
Menu item states in light and dark themes:
- Enabled
- Hovered
- Focused
- Pressed

### Measurements
FAB menu items share the same measurements as the medium button specs.
The close button should always be 56dp.
FAB menu size measurements
The FAB menu animates from the top trailing edge of the FAB to ensure a smooth animation.
The FAB should always have 16dp margins
The close button and FAB share the top trailing corner as an anchor and appear in the same place
Larger FABs will place the FAB menu slightly higher, with larger margins underneath.
The medium FAB placement has 16dp margins
The close button is placed higher to align with the top of the medium FAB
The large FAB placement has 16dp margins
The close button is placed higher to align with the top of the large FAB
On web, the FAB menu opens from the FAB, and inherits its interaction states from the baseline menu component, while using the larger, more elevated FAB-menu container surface (container-large shape, level-3 elevation) and larger, contrasting items.
The gap between the FAB and menu can vary, but 4dp is recommended.
Spacing and interaction on FAB menu for web:
- Enabled
- Hovered
- Focused
- Pressed

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate and interact with the FAB menu
- Ensure focus is correct when navigating through the menu

### Interaction & style
FAB menu elements meet the minimum target size of 48dp.
FAB menus have 48x48dp minimum width and sufficient spacing by default
When the FAB menu can scroll, make sure the items scroll behind the close button.
The close button should always be easy to access and unobstructed.
Allow the menu items to scroll behind the close button
Don’t obstruct the close button in short screens like horizontal orientation

### Initial focus
When the FAB is selected, the FAB menu opens, and initial focus remains on the close button, which takes the place of the original FAB.
Then the focus moves from the top menu item to the bottom.
Focus lands on the close button. People can then navigate through all the items.
- Close button
- First menu item
- Second menu item
- Third menu item

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Navigate to the next interactive element |
| Space or Enter | Activate the focused button or item |

### Labeling elements

#### Android
On Android, a FAB menu’s close button should include a state to tell screen readers what action will occur when it's toggled. The close button should be labeled:
- Label: Toggle menu
- Role: Button
- State: Expanded or collapsed
On Android, the close button accessibility labels should include a toggle menu label, button role, and an expanded or collapsed state
FAB menu items should be labeled:
- Label: Match the item’s UI text, such as Reply all
- Role: Button
Label FAB menu items to match their UI text, like Reply all, and use the button role

#### Web
On web, a FAB menu is a combination of a FAB and a menu component. The FAB opens the menu. Follow the accessibility guidelines for FABs and menus.
The FAB's accessibility label should describe the menu that the FAB will open.
