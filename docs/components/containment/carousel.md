# Carousel — M3 spec reference

> **Source:** [Carousel — Material Design 3](https://m3.material.io/components/carousel) · captured 2026-06-04 via agent-browser  
> **Library entry point:** `@ngguide/ui/carousel` · **Group:** containment
>
> Factual spec data (anatomy, color roles, states, measurements) is transcribed as the strict-M3
> reference for this component. Usage/guidelines prose is condensed — see the source for full guidance.
> Per-token baseline values are an interactive table on the source page (they reference the global
> `--md-sys-*` system tokens already implemented under `.specs/m3-tokens`).

## Overview

- Contain visual items like images or video, along with optional label text
- Six layouts: Multi-browse, uncontained, uncontained multi-aspect ratio, hero, center-aligned hero and full-screen
- Layouts can be start-aligned or center-aligned
- Item visuals have a parallax effect when scrolled
- Items change size as they move through the carousel
Carousels can show items of various sizes

### Updates
November 2025
New carousel layout:
- Uncontained multi-aspect ratio
2023
Additional layouts and configurations:
- Uncontained
- Full-screen
- Centered carousels
- Hero carousel layout
- Multi-browse layout
New carousel layout: uncontained multi-aspect ratio

### Differences from M2
This component is new in Material 3.
- Shape: Dynamic carousel items change shape when scrolled
- Motion: Carousel items move at a different speed than their content, creating a parallax effect
- Interaction: When scrolled, carousel items snap into place to maintain the same layout. Hero carousels swipe through one item at a time. Multi-browse carousels scroll through many items at once.
Hero carousels scroll through one large item at a time

### Research
The Material Research Team conducted two studies (quantitative and qualitative) with over 200 participants to understand their perspectives of five different carousel designs. The studies measured their understanding of how to interact with each carousel, their expectations of the number of items in each design, and how they expected carousels to be used.
Summary of findings:
- Participants thought carousels were a good way to explore many different kinds of content
- A previewed or squished item strongly indicated that there was more content to swipe through
- Participants expected around 10 items in a carousel that scrolled multiple items at once
- While some contexts were considered better for some carousel designs, all designs were considered similarly usable

## Specifications

- Container
- Large carousel item
- Medium carousel item
- Small carousel item

### Color
Carousel color roles used for light and dark schemes:
- Container
- Surface

### States
- Enabled
- Hovered
- Focused
- Pressed
- Disabled

### Carousel item dynamic widths
All kinds of carousel items dynamically adapt to the width of the container.
Large items have a customizable maximum width that's used to optimally fit carousel items into the available space.
Small carousel items have a minimum width of 40dp and a maximum width of 56dp.
Items change size as they move through the carousel layout.
Small carousel items have a minimum and maximum width

### Multi-browse
The multi-browse layout shows at least one large, medium, and small carousel item.
- Container
- Large carousel item
- Medium carousel item
- Small carousel item

#### Measurements
Multi-browse carousels have padding on both sides of the container

| Attribute | Value |
| --- | --- |
| Alignment | Vertically centered |
| Leading/trailing padding | 16dp |
| Top/bottom padding | 8dp |
| Padding between elements | 8dp |
| Large item width | Dynamic, or user-set |
| Medium item width | Dynamic |
| Small item width | 40–56dp, dynamic |
| Item corner radius | 28dp |

### Uncontained
The uncontained layout shows items that scroll to the edge of the container.
- Container
- Large carousel item

#### Measurements
Uncontained carousel items bleed over the padding on each side when scrolling

| Attribute | Value |
| --- | --- |
| Alignment | Vertically centered |
| Leading padding | 16dp |
| Top/bottom padding | 8dp |
| Padding between elements | 8dp |
| Item corner radius | 28dp |

### Uncontained mutli-aspect ratio
The uncontained multi-aspect ratio layout shows carousel items of various widths.
- Container
- Carousel item (16:9)
- Carousel item (9:16)
- Carousel item (1:1)
- Carousel item (3:4)

#### Measurements
Uncontained multi-aspect ratio carousels only have leading padding, with 8dp of padding between items.

| Attribute | Value |
| --- | --- |
| Alignment | Vertically centered |
| Leading padding | 16dp |
| Top/bottom padding | 8dp |
| Padding between elements | 8dp |
| Item corner radius | 28dp |

### Hero
The hero layout shows at least one large item and one small item.
- Container
- Large carousel item
- Small carousel item

#### Measurements
Hero carousels have padding on both sides of the container

| Attribute | Value |
| --- | --- |
| Alignment | Vertically centered |
| Leading/Trailing padding | 16dp |
| Top/bottom padding | 8dp |
| Padding between elements | 8dp |
| Large item width | Dynamic |
| Small item width | 40-56dp, dynamic |
| Item corner radius | 28dp |

### Center-aligned hero
The center-aligned hero layout shows at least one large item and two small items.
- Container
- Large carousel item
- Small carousel item

#### Measurements
Center-aligned hero carousels have padding on both sides of the container

| Attribute | Value |
| --- | --- |
| Alignment | Vertically centered |
| Leading/Trailing padding | 16dp |
| Top/bottom padding | 8dp |
| Padding between elements | 8dp |
| Large item width | Dynamic |
| Small item width | 40-56dp, dynamic |
| Item corner radius | 28dp |

### Full-screen
The full-screen layout shows one edge-to-edge large item.
- Container
- Large carousel item

#### Measurements
Full-screen carousels fill the window edge-to-edge

| Attribute | Value |
| --- | --- |
| Alignment | Centered |
| Leading/Trailing padding | 0dp |
| Top/bottom padding | 0dp |
| Padding between elements | 16dp |

## Accessibility

### Use cases
Users should be able to do the following with assistive technology:
- Navigate to the carousel container
- Navigate between different carousel items
- Activate a carousel item
- Skip over the carousel items

### Requirements on scrolling pages
On vertically-scrolling pages, carousels require an accessible way to view all the items without horizontally scrolling. (This requirement doesn't apply to full-screen carousels.)
Material recommends adding a Show all button below the carousel, which opens a dedicated vertically-scrolling page of all carousel items.
Carousels without headers should use a Show all button to view all carousel items
The Show all button should have a padding of 4dp
If the carousel has a header, you can use an arrow icon button instead. Place the arrow icon directly next to the header or in the same row.
Make sure the header is also displayed on the page of all carousel items.
Carousels with headers should use an arrow to view all carousel items
Headers should align with the leading edge, and the arrow icon should have a size of 48dp
Avoid customizing the accessibility solution when possible. However, if your product needs an alternative solution, consider adding a Show all button in nearby navigation, or add alternative control buttons close to the carousel.
Avoid adding UI elements, like arrows or other icons, within or beside the carousel.
Avoid adding buttons into the carousel container or beside it. Place any buttons above or below the carousel.
Don't cover the carousel with buttons or other UI

### Interaction & style

#### Touch
Tapping on a carousel item changes the shape slightly, and creates a touch ripple for interaction feedback.
Touch: Tap

#### Cursor
The hover state provides a visual cue that the carousel item is interactive.
When the carousel item is clicked (in both active and inactive states), a ripple appears for interaction feedback.
Cursor: Hover, click

#### Initial focus
When navigating to a carousel using assistive technology, use Tab to place initial focus on the first carousel item. Then, use Tab or the arrow keys to navigate the carousel items.
Use the up and down arrow keys to leave the carousel and focus on the next element on the page, like the Show all button.
Set initial focus on the first carousel item, and use arrows to navigate items
Avoid focusing on the carousel container

### Keyboard navigation

| Keys | Actions |
| --- | --- |
| Tab or Arrows | Moves to the previous or next carousel item |
| Space or Enter | Activates the focused carousel item |

### Labeling elements
The carousel container has the container role.
The carousel container is labelled appropriately and has the container role
Each carousel may have a different number of items, so the label reads out the total amount of items and the current item in focus.
The carousel item label indicates the current item in focus and the total number of items

### Reduced motion
When reduced motion settings are turned on, the parallax effect should be removed and carousel items should no longer expand as they come into view. All items are the same size.
Make sure carousels with reduced motion reach the edges of the window to avoid clipping visuals.
- Default carousel for multi-scroll
- Carousel with reduced motion settings turned on
For hero carousels with reduced motion, the small carousel item is only partially shown on screen.
- Default carousel for single-scroll
- Carousel with reduced motion settings turned on
