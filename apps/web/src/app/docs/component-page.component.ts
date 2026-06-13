import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  ALL_COMPONENTS,
  findComponent,
  specHref,
} from './component-registry';

/**
 * Per-component documentation page (`/ui/components/:slug`). Mirrors a single
 * m3.material.io component page: a header (category eyebrow, name, entry point,
 * one-liner, and links to the in-repo spec doc + the canonical M3 source),
 * the live demo (lazy-loaded from the gallery, where the copy-paste code panels
 * live), and a prev/next footer to walk the catalogue.
 */
@Component({
  selector: 'app-component-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet, RouterLink],
  template: `
    @if (lookup(); as l) {
      <article class="cp">
        <header class="cp-head">
          <p class="cp-eyebrow">{{ l.category.title }}</p>
          <h1 class="cp-name">{{ l.component.name }}</h1>
          <p class="cp-blurb">{{ l.component.blurb }}</p>
          <div class="cp-meta">
            <code class="cp-entry">{{ l.component.entry }}</code>
            <a
              class="cp-link"
              [href]="spec()"
              target="_blank"
              rel="noopener noreferrer"
              >Spec doc ↗</a
            >
            <a
              class="cp-link"
              [href]="l.component.m3"
              target="_blank"
              rel="noopener noreferrer"
              >M3 source ↗</a
            >
          </div>
        </header>

        @if (cmp(); as c) {
          <ng-container [ngComponentOutlet]="c" />
        } @else {
          <p class="cp-loading">Loading demo…</p>
        }

        <footer class="cp-nav">
          @if (prev(); as p) {
            <a class="cp-nav-link cp-nav-prev" [routerLink]="['/ui/components', p.component.slug]">
              <span class="cp-nav-dir">← Previous</span>
              <span class="cp-nav-name">{{ p.component.name }}</span>
            </a>
          } @else {
            <span></span>
          }
          @if (next(); as n) {
            <a class="cp-nav-link cp-nav-next" [routerLink]="['/ui/components', n.component.slug]">
              <span class="cp-nav-dir">Next →</span>
              <span class="cp-nav-name">{{ n.component.name }}</span>
            </a>
          }
        </footer>
      </article>
    } @else {
      <div class="cp-missing">
        <h1>Component not found</h1>
        <p>No component matches this URL.</p>
        <a routerLink="/ui">← Back to overview</a>
      </div>
    }
  `,
  styleUrl: './component-page.component.css',
})
export class ComponentPageComponent {
  private readonly route = inject(ActivatedRoute);

  /** Current slug from the route, kept live across in-shell navigation. */
  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  protected readonly lookup = computed(() => findComponent(this.slug()) ?? null);
  protected readonly spec = computed(() => {
    const l = this.lookup();
    return l ? specHref(l.category.id, l.component.slug) : '';
  });

  private readonly index = computed(() =>
    ALL_COMPONENTS.findIndex((c) => c.component.slug === this.slug()),
  );
  protected readonly prev = computed(() => {
    const i = this.index();
    return i > 0 ? ALL_COMPONENTS[i - 1] : null;
  });
  protected readonly next = computed(() => {
    const i = this.index();
    return i >= 0 && i < ALL_COMPONENTS.length - 1
      ? ALL_COMPONENTS[i + 1]
      : null;
  });

  /** Lazily-resolved live demo component for the current slug. */
  protected readonly cmp = signal<Type<unknown> | null>(null);

  constructor() {
    // Resolve (or re-resolve) the demo whenever the slug changes. Guard against
    // a late-arriving import for a slug the user already navigated away from.
    effect((onCleanup) => {
      const l = this.lookup();
      this.cmp.set(null);
      if (!l) return;
      let active = true;
      onCleanup(() => (active = false));
      void l.component.load().then((type) => {
        if (active) this.cmp.set(type);
      });
    });
  }
}
