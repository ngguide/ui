# @ngguide/ui

A Material Design 3 UI kit for Angular.

## Theme tokens

The kit is styled entirely with M3 design tokens exposed as CSS custom properties
(`--md-ref-*` / `--md-sys-*`). Import the token stylesheet **once** in your app's
global styles:

```css
@import '@ngguide/ui/styles/theme.css';
```

Without this import, components render with undefined colors/typography.

### Theme mode (light / dark)

By default the kit follows the operating-system color scheme. Force a mode on any
subtree with `data-theme` — it overrides the OS preference for that subtree only:

```html
<body>
  <!-- follows the OS -->
  <section data-theme="dark">…always dark…</section>
  <section data-theme="light">…always light…</section>
</body>
```

### Contrast

Pick one of the three M3 contrast levels with `data-contrast` (default is
`standard`). Like `data-theme`, it can be scoped to any subtree:

```html
<div data-contrast="high">…high-contrast palette…</div>
```

Valid values: `standard`, `medium`, `high`.

### Overriding the typeface

The brand and plain typefaces default to Roboto. **You must load Roboto yourself**
(or substitute another font). Override the reference tokens in your global styles —
every type-scale role updates automatically:

```css
:root {
  --md-ref-typeface-brand: 'Inter', sans-serif;
  --md-ref-typeface-plain: 'Inter', sans-serif;
}
```

### Token families

| Family | Token prefix |
|--------|--------------|
| Color roles | `--md-sys-color-*` |
| Typography | `--md-sys-typescale-<role>-<size>-{font,weight,size,line-height,tracking}` |
| Shape | `--md-sys-shape-corner-*` |
| Elevation | `--md-sys-elevation-level0`…`level5` |
| State layers | `--md-sys-state-*-state-layer-opacity` |
| Motion | `--md-sys-motion-{duration,easing}-*` |
| Typeface refs | `--md-ref-typeface-*` |

Color tokens are generated from the M3 baseline seed by
`tooling/generate-color-tokens.mts` (run via `nx run ui:generate-tokens`); the
output is committed at `src/styles/tokens/_color.generated.css`. The remaining
families are hand-authored from the M3 spec.

> Browser support: the mode/contrast resolution uses the CSS `light-dark()`
> function (Baseline 2024 — Chrome/Edge 123+, Firefox 120+, Safari 17.5+).

## Running unit tests

Run `nx test ui` to execute the unit tests.
