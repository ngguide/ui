# Switch — M3 spec reference

> **Source:** [Switch — Material Design 3](https://m3.material.io/components/switch) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/switch` · **Group:** selection
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Use switches (not radio buttons) if the items in a list can be independently controlled
- Switches are the best way to let people adjust settings
- Make sure the switch’s selection (on or off) is visible at a glance
Switches can be toggled on and off

### Differences from M2
- Accessibility: Visual presentation is more accessible
- Color: New color mappings meet Material's non-text-contrast requirements in addition to compatibility with dynamic color
- Icons: Ability to have an optional icon within the switch handle
- Layout: Track is taller and wider
M2: Switches have a circular handle that extends beyond the edge of the track
M3: Switches have a taller and wider track, new color mappings, and the ability to show an icon in the handle

## Specifications

- Track
- Handle (formerly "thumb")
- Icon

### Color
Switch color roles used for light and dark themes:
- Surface container highest
- Outline
- Primary
- On primary
- On primary container

#### Adjacent text label color
Use the color role on surface for adjacent text labels. This remains the same even if interacting with the label or component.
The text label uses on surface. Supporting text may use on surface variant.

### States
- Enabled
- Hovered
- Focused
- Pressed
- Disabled
State specs are in the token module above

### Measurements
Switches without icons
Pressed switches without icons
Switches with icons
Pressed switches with icons

| Element | Attribute | Value |
| --- | --- | --- |
| Track | Height | 32dp |
| Width | 52dp |
| Outline width | 2dp |
| Shape | md.sys.shape.corner.full |
| Handle | Height (unselected) | 16dp |
| Height - with icon | 24dp |
| Height (selected) | 24dp |
| Height (pressed) | 28dp |
| Width (unselected) | 16dp |
| Width - with icon | 24dp |
| Width (selected) | 24dp |
| Width (pressed) | 28dp |
| Shape | md.sys.shape.corner.full |
| State layer | Size | 40dp |
| Shape | md.sys.shape.corner.full |
| Target | Size | 48dp |
| Icon | Size (selected) | 16dp |
| Icon | Size (unselected) | 16dp |

### Configurations
- Without icons
- Icon on selected switch
- Icon on selected and unselected switch

## Accessibility

### Use cases
People should be able to do the following with assistive technology:
- Navigate to a switch with a keyboard or switch input
- Toggle the switch on and off
- Get appropriate feedback based on input type documented under Interaction & style

### Interaction & style
The switch handle increases in size to indicate interactivity for both touch and cursor control interactions.
Touch When tapped or dragged, the handle size grows, providing interaction feedback.
Cursor When hovered (in both on and off states), the hover area grows, providing a visual cue that the handle is interactive. When clicked, the handle size grows.
Touch: Tap, Drag
Cursor: Hover, Click

#### Avoid applying density by default
Don't apply density to switches by default — this lowers their targets below our best practice of 48x48 CSS pixels. Instead, give people a way to choose a higher density, like selecting a denser layout or changing the theme.
To ensure that this density setting can easily be reverted when it's active, keep all targets to change it at a minimum 48x48 CSS pixels each.

### Initial focus
Initial focus lands directly on the switch’s handle, since it’s the primary interactive element of the component.
Focus lands on the switch handle
The switch is toggled using Space or Enter

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab | Focus lands on the switch handle |
| Space or Enter | Toggles the handle on and off |

### Labeling elements
The accessibility label for a switch uses the adjacent label text if implemented correctly.
Assistive tech such as a screen reader will read the UI text followed by the component’s role.
A switch’s accessibility label can incorporate its adjacent UI text
When the visible UI text is ambiguous, accessibility labels need to be more descriptive. For example, a switch visibly labelled Photo album would benefit from additional information to clarify the switch’s function.
Consider making the adjacent label text more descriptive when possible. This reduces the need for different accessibility text.
While the visible label text reads Photo album, the accessibility label for this switch clarifies its function: Photo album access
