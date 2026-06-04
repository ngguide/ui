import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Presentational chrome for the component vitrine (`/gallery`). Three nesting
 * primitives give every per-component demo a uniform skeleton, so the gallery
 * reads as one coherent surface no matter who authored each demo:
 *
 * ```html
 * <app-demo-component name="Button" entry="@ngguide/ui/button" docHref="…">
 *   <app-demo-block heading="Variants" hint="Five color configurations">
 *     <app-demo-specimen label="filled">…</app-demo-specimen>
 *     <app-demo-specimen label="outlined">…</app-demo-specimen>
 *   </app-demo-block>
 * </app-demo-component>
 * ```
 *
 * Pure layout — every color is an `--md-sys-*` token, so the vitrine re-themes
 * live with the shell's dark-mode switch and brand-seed picker.
 */
@Component({
  selector: 'app-demo-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="demo-component-head">
      <h2 [id]="anchor()" class="demo-component-name">{{ name() }}</h2>
      @if (entry()) {
        <code class="demo-component-entry">{{ entry() }}</code>
      }
      @if (docHref()) {
        <a
          class="demo-component-doc"
          [href]="docHref()"
          target="_blank"
          rel="noopener noreferrer"
          >spec ↗</a
        >
      }
    </header>
    <div class="demo-component-body">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      scroll-margin-top: 1rem;
    }
    .demo-component-head {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    .demo-component-name {
      margin: 0;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-family: var(--md-sys-typescale-headline-small-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
      line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
      font-weight: var(--md-sys-typescale-headline-small-weight, 400);
    }
    .demo-component-entry {
      color: var(--md-sys-color-on-surface-variant, #49454e);
      font-family: 'Roboto Mono', ui-monospace, monospace;
      font-size: 0.8125rem;
      background: var(--md-sys-color-surface-container-high, #ece6f0);
      border-radius: var(--md-sys-shape-corner-small, 8px);
      padding: 0.125rem 0.5rem;
    }
    .demo-component-doc {
      color: var(--md-sys-color-primary, #6750a4);
      text-decoration: none;
      font-size: 0.8125rem;
    }
    .demo-component-doc:hover {
      text-decoration: underline;
    }
  `,
})
export class DemoComponentComponent {
  /** Human-facing component name shown as the section heading. */
  readonly name = input.required<string>();
  /** Library entry point, e.g. `@ngguide/ui/button`. */
  readonly entry = input('');
  /** Optional link to the M3 spec reference doc. */
  readonly docHref = input('');

  /** Stable in-page anchor id derived from the name (no RNG/clock). */
  protected readonly anchor = computed(
    () => 'c-' + this.name().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  );
}

/**
 * A labelled group of specimens within a component demo — e.g. "Variants",
 * "Sizes", "States". Renders the heading, an optional hint, and a wrapping
 * canvas that lays its specimens out in a responsive flow.
 */
@Component({
  selector: 'app-demo-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-block-head">
      <h3 class="demo-block-heading">{{ heading() }}</h3>
      @if (hint()) {
        <p class="demo-block-hint">{{ hint() }}</p>
      }
    </div>
    <div class="demo-block-canvas" [class.demo-block-canvas--column]="column()">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin: 1.25rem 0 0.5rem;
    }
    .demo-block-head {
      margin-bottom: 0.75rem;
    }
    .demo-block-heading {
      margin: 0;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-family: var(--md-sys-typescale-title-medium-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-title-medium-size, 1rem);
      line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
      font-weight: var(--md-sys-typescale-title-medium-weight, 500);
    }
    .demo-block-hint {
      margin: 0.125rem 0 0;
      color: var(--md-sys-color-on-surface-variant, #49454e);
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    }
    .demo-block-canvas {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
      border-radius: var(--md-sys-shape-corner-large, 16px);
      background: var(--md-sys-color-surface-container-low, #f7f2fa);
    }
    .demo-block-canvas--column {
      flex-direction: column;
      align-items: stretch;
    }
  `,
})
export class DemoBlockComponent {
  /** Group heading, e.g. "Variants". */
  readonly heading = input.required<string>();
  /** Optional one-line note under the heading. */
  readonly hint = input('');
  /** Stack specimens vertically (full-width controls, lists, text fields). */
  readonly column = input(false);
}

/**
 * A single labelled specimen cell. The projected content is the live component;
 * the caption underneath names the variant/state it demonstrates.
 */
@Component({
  selector: 'app-demo-specimen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo-specimen-stage">
      <ng-content />
    </div>
    @if (label()) {
      <span class="demo-specimen-label">{{ label() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }
    :host(.fill) {
      display: flex;
      align-self: stretch;
      width: 100%;
    }
    :host(.fill) .demo-specimen-stage {
      width: 100%;
    }
    .demo-specimen-stage {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .demo-specimen-label {
      color: var(--md-sys-color-on-surface-variant, #49454e);
      font-family: 'Roboto Mono', ui-monospace, monospace;
      font-size: 0.75rem;
      text-align: center;
    }
  `,
})
export class DemoSpecimenComponent {
  /** Caption shown under the specimen (variant or state name). */
  readonly label = input('');
}

/** Spread into a demo component's `imports` to get all three primitives. */
export const GALLERY_DEMO_UI = [
  DemoComponentComponent,
  DemoBlockComponent,
  DemoSpecimenComponent,
] as const;
