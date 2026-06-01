# @ngguide/ui/theme

Secondary entry point of `@ngguide/ui`. Import it from `@ngguide/ui/theme`.

Runtime **M3 dynamic color**: generate a full Material Design 3 color scheme from a
source color (the HCT / tonal-palette algorithm via
[`@material/material-color-utilities`](https://www.npmjs.com/package/@material/material-color-utilities))
and apply it as the same `--md-sys-color-*` token contract the components already style
against. The static `m3-tokens` baseline remains the default until you opt in.

## Configure at bootstrap

```ts
import { provideM3Theme } from '@ngguide/ui/theme';

bootstrapApplication(App, {
  providers: [
    provideM3Theme({
      sourceColor: '#6750A4', // required (hex seed)
      variant: 'tonal-spot',  // default 'tonal-spot' — any of the 9 M3 variants
      contrast: 'standard',   // 'standard' | 'medium' | 'high'
      mode: 'auto',           // 'auto' (follow OS) | 'light' | 'dark'
      customColors: [
        { name: 'brand-success', value: '#2e7d32' /* harmonize: true by default */ },
      ],
    }),
  ],
});
```

The configured scheme is applied on the server and the client, so it is in effect for the
first render. An invalid `sourceColor` or custom-color value throws at bootstrap (fail-fast).

## Change the theme at runtime

```ts
import { M3ThemeService } from '@ngguide/ui/theme';

const theme = inject(M3ThemeService);
theme.setTheme({ sourceColor: '#00629D', variant: 'vibrant' }); // re-themes the running app
```

## Read computed values

```ts
const roles = theme.resolve({ mode: 'light', contrast: 'standard' });
roles['primary'];            // e.g. '#65558f'
roles['brand-success'];      // custom-color role
```

`resolve()` returns a flat role→hex map (keys without the `--md-sys-color-` prefix),
equal to the values applied to the token contract for that mode/contrast.

## Custom colors

Each custom color emits four roles — `--md-sys-color-<name>`, `--md-sys-color-on-<name>`,
`--md-sys-color-<name>-container`, `--md-sys-color-on-<name>-container` — for both light and
dark and at the selected contrast level. By default the color's hue is **harmonized** toward
the source color; set `harmonize: false` to keep the raw hue. A custom `name` whose derived
roles would collide with a core role (e.g. `surface` → `on-surface`) is rejected.

## Variants

`monochrome`, `neutral`, `tonal-spot` (default), `vibrant`, `expressive`, `fidelity`,
`content`, `rainbow`, `fruit-salad` — exactly the published M3 scheme variants.
