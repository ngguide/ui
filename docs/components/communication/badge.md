# Badges — M3 spec reference

> **Source:** [Badges — Material Design 3](https://m3.material.io/components/badges) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/badge` · **Group:** communication
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Can contain labels or numbers
- Two variants: small and large
- Anchor badges inside the icon bounding box, at the upper trailing edge of the icon
- Limit content to four characters, including a +
- Keep the default color mapping
- Small badge on a navigation item
- Large badge on a navigation item
- Large badge with max characters on a navigation item

### Differences from M2
- Color: New color mappings and compatibility with dynamic color
Badges have new color mappings

## Specifications

Navigation bar
- Small badge
- Large badge container
- Large badge label
- Large badge maximum character count container
- Large badge maximum character count label
Navigation rail
- Small badge
- Large badge container
- Large badge label
- Large badge maximum character count container
- Large badge maximum character count label

### Color
Badge color roles used for light and dark schemes in navigation bar:
- Error
- On error
- Error
Badge color roles used for light and dark schemes in navigation rail:
- Error
- On error
- Error
- On error
- Error

### Measurements
Badge padding and size measurements

| Attribute | Value |
| --- | --- |
| Small badge shape | 3dp corner radius |
| Small badge size (HxW) | 6dp |
| Large badge shape | 8dp corner radius |
| Large badge one digit size (HxW) | 16dp |
| Large badge max character count size (HxW) | 16x34dp |
| Small badge: distance from top trailing icon corner to bottom leading badge corner (HxW) | 6x6dp |
| Large badge: distance from top trailing icon corner to bottom leading badge corner (HxW) | 14x12dp |
| Large badge padding between badge and text container | 4dp |

### Configuration
Different badges are shown on navigation destinations in various states.
- Inactive with label - small badge
- Inactive with label - large badge
- Inactive with label - large badge max character count
- Inactive - small badge
- Inactive - large badge
- Inactive - large badge max character count
- Active with label - small badge
- Active with label - large badge
- Active with label - large badge max character count
- Active nav bar no label - small badge
- Active nav bar no label - large badge
- Active nav bar no label - large badge max character count
- Active nav rail no label - small badge
- Active nav rail no label - large badge
- Active nav rail no label - large badge max character count

## Accessibility

### Use cases
People should be able to use assistive technology to:
- Understand the dynamic information conveyed in badges, such as counts or labels
- Address badge announcements by selecting corresponding navigation destinations

### Interaction & style
Badges are most commonly used within other components, such as navigation bar, navigation rail, app bars, and tabs. When a badge is used to indicate an unread notification, the badge gets hidden once it's selected.

### Visual indicators
Badges use a color intended to stand out against labels, icons, and navigation elements. Use the default color mapping to avoid color conflict issues.
Badges must use default color with at least 3:1 contrast
Avoid using custom color roles for the badge container and label text. If custom roles are necessary, make sure they have contrast of at least 3:1.

### Labeling elements
The accessibility label for a badge item will be read after its navigation destination. Any numerical badges will have their number read, while non-counting badges will simply announce New notification.
Numerical badges will have their number read
Non-counting badges will simply announce New notification
