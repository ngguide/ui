import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Chrome for a single gallery category page: a page title and an in-page table
 * of contents that anchor-links to each component section (the `c-<slug>` ids
 * minted by {@link DemoComponentComponent}). Category pages stay declarative —
 * they pass the component names in and project the demos as content.
 */
@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="gallery-page-head">
      <p class="gallery-page-eyebrow">Component gallery</p>
      <h1 class="gallery-page-title">{{ title() }}</h1>
      <nav class="gallery-page-toc" aria-label="Components on this page">
        @for (item of toc(); track item.anchor) {
          <a class="gallery-page-toc-link" [href]="'#' + item.anchor">{{ item.name }}</a>
        }
      </nav>
    </header>
    <div class="gallery-page-sections">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.5rem clamp(1rem, 4vw, 2.5rem) 4rem;
    }
    .gallery-page-head {
      margin-bottom: 2rem;
    }
    .gallery-page-eyebrow {
      margin: 0;
      color: var(--md-sys-color-primary, #6750a4);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.6875rem;
      font-weight: 600;
    }
    .gallery-page-title {
      margin: 0.25rem 0 1rem;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-family: var(--md-sys-typescale-display-small-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-display-small-size, 2.25rem);
      line-height: var(--md-sys-typescale-display-small-line-height, 2.75rem);
      font-weight: var(--md-sys-typescale-display-small-weight, 400);
    }
    .gallery-page-toc {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .gallery-page-toc-link {
      color: var(--md-sys-color-on-secondary-container, #1d192b);
      background: var(--md-sys-color-secondary-container, #e8def8);
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      padding: 0.25rem 0.75rem;
      font-size: 0.8125rem;
      text-decoration: none;
    }
    .gallery-page-toc-link:hover {
      filter: brightness(0.97);
    }
    .gallery-page-sections {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
  `,
})
export class GalleryPageComponent {
  /** Page title, e.g. "Actions". */
  readonly title = input.required<string>();
  /** Component names shown on this page; anchors are derived to match the demos. */
  readonly componentNames = input.required<readonly string[]>();

  protected readonly toc = computed(() =>
    this.componentNames().map((name) => ({
      name,
      anchor: 'c-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    })),
  );
}
