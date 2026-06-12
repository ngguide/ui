import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodePanelComponent } from './code-panel.component';
import { DOC_CATEGORIES } from './component-registry';

/**
 * Documentation home (`/ui`) — a Material-Design-3-style landing page: a hero
 * lockup over the same dynamic-color surface as the rest of the site, then a
 * card grid of the component categories, each linking through to its first
 * component. Mirrors how m3.material.io fronts its component catalogue.
 */
@Component({
  selector: 'app-docs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CodePanelComponent],
  template: `
    <section class="home-hero">
      <p class="home-eyebrow">Angular · Material Design 3</p>
      <h1 class="home-title">A from-scratch M3 component kit for Angular</h1>
      <p class="home-lede">
        {{ totalComponents }} components built strictly to the Material Design 3
        specification — not a wrapper around Angular Material. Every example below
        is live and re-themeable, and ships with copy-paste code and a link to its
        in-repo M3 spec.
      </p>
      <div class="home-actions">
        <a
          class="home-cta home-cta--filled"
          [routerLink]="['/ui/components', firstSlug]"
        >
          Browse components
        </a>
        <a
          class="home-cta home-cta--text"
          href="https://github.com/ngguide/ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </div>
    </section>

    <section class="start" aria-label="Get started">
      <h2 class="start-title">Get started</h2>
      <ol class="start-steps">
        <li class="start-step">
          <div class="start-step-head">
            <span class="start-num">1</span>
            <h3 class="start-step-title">Install</h3>
          </div>
          <p class="start-desc">Add the package to an Angular 21+ app.</p>
          <app-code [code]="codeInstall" language="bash" />
        </li>
        <li class="start-step">
          <div class="start-step-head">
            <span class="start-num">2</span>
            <h3 class="start-step-title">Set the theme</h3>
          </div>
          <p class="start-desc">
            One brand color generates the whole M3 token set — every
            <code>--md-sys-*</code> role, light and dark.
            <code>mode: 'auto'</code> follows the OS. This is all the theming the
            components need.
          </p>
          <app-code [code]="codeTheme" language="ts" />
        </li>
        <li class="start-step">
          <div class="start-step-head">
            <span class="start-num">3</span>
            <h3 class="start-step-title">Use a component</h3>
          </div>
          <p class="start-desc">
            Each component is its own entry point — import only what you use.
          </p>
          <app-code [code]="codeUse" language="ts" />
        </li>
      </ol>
      <p class="start-note">
        Icons use the
        <a
          href="https://fonts.google.com/icons"
          target="_blank"
          rel="noopener noreferrer"
          >Material Symbols</a
        >
        font — load it once in your global styles. Need to re-theme at runtime
        (brand switch, dark toggle)? Inject <code>M3ThemeService</code> and call
        <code>setTheme()</code>.
      </p>
    </section>

    <section class="home-grid" aria-label="Component categories">
      @for (category of categories; track category.id) {
        <article class="home-card">
          <h2 class="home-card-title">{{ category.title }}</h2>
          <p class="home-card-blurb">{{ category.blurb }}</p>
          <ul class="home-card-list">
            @for (component of category.components; track component.slug) {
              <li>
                <a [routerLink]="['/ui/components', component.slug]">
                  {{ component.name }}
                </a>
              </li>
            }
          </ul>
        </article>
      }
    </section>
  `,
  styleUrl: './docs-home.component.css',
})
export class DocsHomeComponent {
  protected readonly categories = DOC_CATEGORIES;
  protected readonly firstSlug = DOC_CATEGORIES[0].components[0].slug;
  protected readonly totalComponents = DOC_CATEGORIES.reduce(
    (sum, category) => sum + category.components.length,
    0,
  );

  protected readonly codeInstall = `
npm install @ngguide/ui`;

  protected readonly codeTheme = `
// app.config.ts
import { provideM3Theme } from '@ngguide/ui/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    // One brand seed -> the full M3 dynamic-color token set.
    provideM3Theme({
      sourceColor: '#6750A4',   // your brand color
      variant: 'tonal-spot',
      contrast: 'standard',
      mode: 'auto',             // 'light' | 'dark' | 'auto'
    }),
  ],
};`;

  protected readonly codeUse = `
import { ButtonComponent } from '@ngguide/ui/button';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  template: \`<button gui-button variant="filled">Get started</button>\`,
})
export class AppComponent {}`;
}
