# Menus — M3 spec reference

> **Source:** [Menus — Material Design 3](https://m3.material.io/components/menus) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/menu` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use a menu to show a temporary set of actions. To show actions on screen at all times, use a toolbar instead
- Menus can open from many components, including icon buttons, split buttons, and text fields
- Context menus provide actions for a specific element, like an image or highlighted text, and usually open with a secondary click
Vertical menus can include vibrant colors, gaps, dividers, and submenus to organize a list of choices

### M3 Expressive update
November 2025
Vertical menus were introduced with new shapes, color styles, selection states, and refined submenu motion. Gaps can be used for a more flexible layout on Android. More on M3 Expressive
Variants:
- Added vertical menus, recommended for new designs
- Baseline menu is still available
Color styles:
- Standard
- Vibrant
Vibrant colors help selected menu items stand out

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
- Variants: Dropdown menu and exposed dropdown menu are now both referred to as menu, since they differ only in the element which opens the menu surface
M2: Former menu colors don’t contrast with the background
M3: Menus feature new color mappings and dynamic color

## Specifications

### Variants

#### Vertical menus
Use vertical menus for a more expressive look and feel, including rounded corners, standard and vibrant color styles, more selection states, and submenu motion.
- Vertical menu with gap
- Vertical menu with divider

#### Baseline variant
In M3 Expressive, baseline menu is still available to use, but doesn’t have the latest shapes, color styles, selection states, and motion. See baseline menu specs
A baseline menu has square corners, as compared to a vertical menu’s round corners and expressive styling

| Variant | M3 | M3 Expressive |
| --- | --- | --- |
| Vertical menus | -- | Available |
| Menu ( baseline) | Available | Available |

### Configurations

#### Vertical menus layout
- Standard
- Grouped

| Category | Configuration | M3 | M3 Expressive |
| --- | --- | --- | --- |
| Color | Standard | Available | Available |
| Vibrant | -- | Available |
| Layout | Standard | Available | Available |
| Grouped | -- | Available |

### Anatomy

#### Vertical menus
- Menu item
- Leading icon (optional)
- Menu item text
- Trailing icon (optional)
- Badge (optional)
- Trailing text (optional)
- Container
- Supporting text (optional)
- Label text (optional)
- Gap (optional)
- Divider (optional)

### Color
Menus have two color mappings:
- Standard: Surface-based
- Vibrant: Tertiary-based
These mappings provide options for lower or higher visual emphasis. Vibrant menus are more prominent so should be used sparingly.
- Standard color scheme
- Vibrant color scheme

#### Standard colors
Vertical menus color roles used for light and dark themes:
- On surface variant
- On surface
- On surface (state layer)
- Surface container low
- On surface variant
- Tertiary container (selected)
- On tertiary container (selected)
- On surface variant
- On tertiary container (selected)

#### Vibrant colors
Vertical menus color roles used for light and dark themes:
- On tertiary container
- On tertiary container (state layer)
- Tertiary container
- On tertiary container
- Tertiary (selected)
- On tertiary (selected)
- On tertiary container
- On tertiary (selected)

### States
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
- Active (main menu reveals submenu)

### Measurements
Vertical menu padding and size measurements

### Menu (baseline)
The baseline menu variant is available and continues to work in existing products. However, M3 expressive vertical menus are recommended for new designs.

#### Anatomy
- List item
- List item leading icon
- List item trailing icon
- Container
- List item trailing text
- Divider

#### Color
Baseline menu color roles used for light and dark themes:
- On surface variant
- On surface
- On surface - opacity: 0.08
- Surface container
- On surface variant
- Surface container highest
- Outline variant

#### States

##### Default menu items
- Enabled
- Disabled
- Hovered
- Focused
- Pressed

##### Selected menu items
- Enabled
- Disabled
- Hovered
- Focused
- Pressed
State specs are in the token module above

#### Measurements
Baseline menu padding and size measurements

| Attribute | Value |
| --- | --- |
| Container width | 112dp min, 280dp max |
| Corner radius | 4dp |
| Vertical label text alignment | Center-aligned |
| Horizontal label text alignment | Start-aligned |
| Left/right padding | 12dp |
| Left/right padding with-icon | 12dp |
| List item height | 48dp |
| Padding between elements within a list item | 12dp |
| Divider top/bottom padding | 8dp |
| Divider height | 1dp |
| Divider width | Dynamic |
| Leading/trailing icon size | 24dp |

#### Configurations
A baseline menu appears when a person interacts with a button, action, or other control.
A few examples:
- Button
- Text field
- Icon button
- Selected text

## Accessibility

### Use cases
People should be able to do the following using assistive technology:
- Navigate to, open, and close a menu
- Navigate between and select menu items

### Interaction & style
Menu items need certain cues to clearly show when they're selected:
- By default, menu items change shape and color when selected
- The default color contrast is 3:1 between selected and unselected menu items
- It's recommended to include another visual cue, like a checkmark
Use multiple visual cues like color, shape, and icons to show that an item is selected

### Flexibility & slots
Use caution when adding slots to menus:
- Make sure the menu remains accessible
- Elements must follow the rules and interaction patterns of the menu component
- Keep the same menu item padding
- Targets should be 48x48dp or larger
Don't add buttons, switches, or other direct actions into the menu item. Nested elements should only perform one action. Adding multiple actions can break keyboard navigation and screen reader functionality.
More on slots in menus
Reserve the use of slots for use cases that maintain the menu’s accessibility and functionality

### Focus
Initial focus
When a menu opens, focus should be placed on the first menu item. This allows people using a keyboard or other assistive technologies to begin navigating the menu immediately.
Exiting a menu
People expect to exit a menu by:
- Selecting an option
- Tapping Escape or outside of the menu
- Using the system back button
Where focus is placed after closing the menu depends on the app.
Keyboard navigation on Android and web:
- Tab to select a menu item
- Space or Enter to open a menu
- Space or Enter to select a menu item
- Escape to close a menu

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on menu |
| Space or Enter | For closed menus: Opens menu or submenu For open menus: Selects a menu item |
| Up and Down arrows | For closed menus: Opens menu For open menus: Moves focus to the next item |
| Left and Right arrows | Opens or closes a submenu |
| Letters | Focus moves to the next menu item starting with letter |
| Escape | Closes menu |

### Interactability
Disabled menu items can receive focus but aren't selectable.
Dividers and gaps can't receive focus.
Disabled menu items can receive focus
A divider or gap can’t receive focus

### Labeling elements
Accessibility labels are used with assistive technology devices like screen readers.
The accessibility label should be the same as the menu item text.
The role is dependent on platform.
The menu item’s accessibility label aligns with the UI text

| Element | A11y label | Role (Web) | Role (Android Views) | Role (Jetpack Compose) |
| --- | --- | --- | --- | --- |
| Menu item text | Preview | Menu item | Generic actionable element | Generic actionable element |

For menu items with text and an icon, the icon’s accessibility label should be marked as decorative to avoid redundant verbalizations.
For menu items with text and an icon, the icon’s accessibility label is decorative
