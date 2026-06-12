import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@ngguide/ui/icon';
import { DEMO_APPS } from './nav';

/**
 * Persistent top-level destination switcher, shown in *both* the docs-site bar
 * and the demo-app shell bar so the choice between the component reference and
 * the example apps (Console · Tracker · Commerce) is always one click away in
 * the header — never hidden behind a dropdown.
 *
 * "Components" points at the docs site (`/ui`, the index); the rest are derived
 * from {@link DEMO_APPS} so adding an example app surfaces it here automatically.
 */
@Component({
  selector: 'app-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="appsw" aria-label="Switch example">
      @for (dest of destinations; track dest.path) {
        <a
          class="appsw-link"
          [routerLink]="dest.path"
          routerLinkActive="is-active"
        >
          <gui-icon class="sym appsw-icon">{{ dest.icon }}</gui-icon>
          <span class="appsw-label">{{ dest.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .appsw {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .appsw::-webkit-scrollbar {
      display: none;
    }
    .appsw-link {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      height: 36px;
      padding: 0 0.875rem;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      color: var(--md-sys-color-on-surface-variant, #49454e);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .appsw-link:hover {
      background: color-mix(
        in srgb,
        var(--md-sys-color-on-surface, #1c1b1f) 6%,
        transparent
      );
    }
    .appsw-link.is-active {
      background: var(--md-sys-color-secondary-container, #e8def8);
      color: var(--md-sys-color-on-secondary-container, #1d192b);
    }
    .appsw-icon {
      --gui-comp-icon-size: 20px;
      font-size: 20px;
    }
    /* On a compact bar drop the labels, keep the icons as a tab strip. */
    @media (max-width: 620px) {
      .appsw-label {
        display: none;
      }
      .appsw-link {
        padding: 0 0.625rem;
      }
    }
  `,
})
export class AppSwitcherComponent {
  protected readonly destinations = [
    { label: 'Components', icon: 'widgets', path: '/ui' },
    ...DEMO_APPS.map((app) => ({
      label: app.label,
      icon: app.icon,
      path: app.basePath,
    })),
  ];
}
