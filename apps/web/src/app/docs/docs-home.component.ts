import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [RouterLink],
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
}
