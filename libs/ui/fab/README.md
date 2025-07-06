# Floating Action Button (FAB)

The **Floating Action Button** (FAB) is a circular button that represents the primary action of a screen.  
It “floats” above the interface, drawing the user’s attention to a high-value action while staying out of the way of normal content.

This component is a fresh **Material Design 3** (M3) implementation—built from scratch for `@ngguide/ui`.  
It does **not** depend on Angular Material and fully supports theming via CSS custom-properties.

---

## ⬇️ Installation

```bash
npm i @ngguide/ui
```

Add the secondary entry-point to your module / standalone component:

```ts
// Stand-alone component
import { Component } from '@angular/core';
import { FabComponent } from '@ngguide/ui/fab';

@Component({
  standalone: true,
  imports: [FabComponent],
  template: `<button gui-fab>+</button>`,
})
export class DemoComponent {}
```

---

## 🏁 Quick start

### Primary FAB

```html
<button gui-fab aria-label="Create">
  <svg class="icon">…</svg>
</button>
```

### Secondary (tonal) FAB

```html
<button gui-fab variant="secondary" aria-label="Edit">
  <svg class="icon">…</svg>
</button>
```

### Extended FAB

```html
<button
  gui-fab
  extended
  variant="primary"
  aria-label="Send"
>
  <svg class="icon">…</svg>
  Send
</button>
```

---

## ⚙️ API reference

| Input            | Type                                                                         | Default | Description                                               |
| ---------------- | ---------------------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| `variant`        | `'primary' &#124; 'secondary' &#124; 'tertiary' &#124; 'surface'`            | `primary` | Visual style of the FAB.                                  |
| `size`           | `'xs' \* &#124; 'sm' &#124; **'md'** &#124; 'lg' \*                          | `md`    | Diameter of the FAB. `md` matches M3 spec (56 px).        |
| `extended`       | `boolean`                                                                    | `false` | When `true` FAB becomes a pill shape that can hold a label. |
| `disabled`       | `boolean` (native `disabled` attr is forwarded)                              | `false` | Disables interaction and lowers opacity.                  |

\* Only `sm` (40 px) and `lg` (96 px) are currently implemented. `xs` will be added in a later revision.

---

## 🎨 Variants

| Variant    | Token reference (light theme)                     | Typical use                              |
| ---------- | ------------------------------------------------- | ---------------------------------------- |
| `primary`  | `--md-sys-color-primary / on-primary`             | Highest-emphasis action                 |
| `secondary`| `--md-sys-color-secondary-container / on-secondary-container` | Complementary key action                |
| `tertiary` | `--md-sys-color-tertiary-container / on-tertiary-container`   | Less prominent, helpful action          |
| `surface`  | `--md-sys-color-surface-container-high / primary`| Low-emphasis action that blends with UI |

---

## 📐 Sizes

| Size | Diameter | Extended height |
| ---- | -------- | --------------- |
| `sm` | 40 px    | 40 px           |
| `md` | 56 px (spec) | 56 px       |
| `lg` | 96 px    | 96 px           |

---

## ➕ Extended FAB

Set the `extended` input (or attribute) to transform the FAB into a pill shape capable of displaying a label alongside the icon.

```html
<button gui-fab extended variant="tertiary">
  <svg class="icon">…</svg>
  Add to cart
</button>
```

The component automatically adapts its border-radius, padding and gap according to the selected `size`.

---

## ♿ Accessibility

* Always set an **accessible label** (`aria-label`) that describes the action.
* FABs receive `role="button"` and expose `aria-disabled` when disabled.
* Visual focus is implemented with the design-tokenised focus ring (`--md-sys-state-focus-indicator-thickness` etc.).
* Ensure the FAB is reachable via keyboard and does **not** obstruct other interactive elements.

---

## 📏 Material Design 3 compliance

| Spec item                    | Status |
| ---------------------------- | ------ |
| Color, elevation & states    | ✅ Implemented via CSS variables (`--md-sys-*`). |
| Small / Medium / Large sizes | ✅ `sm`, `md`, `lg` implemented. |
| Primary / Secondary / Tertiary / Tonal Primary / Tonal Secondary / Tonal Tertiary | ✅ All six tokens according to M3 guidelines. |
| Extended variant             | ✅ Supported through `extended` input. |
| Motion & transform           | ⏳ Planned – will be added alongside animation utilities. |
| Icon slot                    | ✅ Content projection allows any icon implementation. |

---

## 📚 Further reading

* [Material Design 3 – Floating Action Button](https://m3.material.io/components/floating-action-button/overview)
* [Angular UI Kit documentation](https://ng.guide/ui-kit?utm_source=github&utm_medium=readme&utm_campaign=ui-kit) – course & full library docs.
