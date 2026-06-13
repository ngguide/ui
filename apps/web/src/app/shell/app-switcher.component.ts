import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { IconComponent } from '@ngguide/ui/icon';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';
import { DEMO_APPS } from './nav';

interface SwitchDest {
  readonly label: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly path: string;
}

/**
 * Top-level destination switcher, shared by *both* the docs-site bar and the
 * demo-app shell bar so the choice between the component reference and the
 * example apps is reachable from the header on every page — the same dropdown
 * "plate" the shell originally used, now also present on the docs.
 *
 * "Components" points at the docs site (`/ui`, the index); the rest are derived
 * from {@link DEMO_APPS}. The active destination is matched from the router URL.
 */
@Component({
  selector: 'app-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkMenuTrigger,
    CdkMenu,
    RouterLink,
    IconComponent,
    MenuDirective,
    MenuItemComponent,
  ],
  template: `
    <button
      type="button"
      class="appsw-trigger"
      [cdkMenuTriggerFor]="menu"
      aria-label="Switch example"
    >
      <gui-icon class="sym appsw-trigger-icon">{{ active().icon }}</gui-icon>
      <span class="appsw-trigger-label">{{ active().label }}</span>
      <gui-icon class="sym appsw-trigger-caret">arrow_drop_down</gui-icon>
    </button>

    <ng-template #menu>
      <div gui-menu cdkMenu class="appsw-menu">
        @for (dest of destinations; track dest.path) {
          <button gui-menu-item [routerLink]="dest.path">
            <gui-icon class="sym" guiMenuItemLeading>{{ dest.icon }}</gui-icon>
            {{ dest.label }}
            <span guiMenuItemTrailing>{{ dest.subtitle }}</span>
          </button>
        }
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: inline-flex;
      min-width: 0;
    }
    .appsw-trigger {
      appearance: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      min-width: 0;
      height: 40px;
      padding: 0 0.5rem 0 0.75rem;
      border: none;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: transparent;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
    }
    .appsw-trigger:hover {
      background: color-mix(
        in srgb,
        var(--md-sys-color-on-surface, #1c1b1f) 8%,
        transparent
      );
    }
    .appsw-trigger-icon {
      --gui-comp-icon-size: 22px;
      font-size: 22px;
      color: var(--md-sys-color-on-surface-variant, #49454e);
    }
    .appsw-trigger-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .appsw-trigger-caret {
      --gui-comp-icon-size: 22px;
      font-size: 22px;
      color: var(--md-sys-color-on-surface-variant, #49454e);
    }
    @media (max-width: 600px) {
      .appsw-trigger-label {
        display: none;
      }
    }
  `,
})
export class AppSwitcherComponent {
  private readonly router = inject(Router);

  protected readonly destinations: readonly SwitchDest[] = [
    {
      label: 'Components',
      subtitle: 'M3 reference',
      icon: 'widgets',
      path: '/ui',
    },
    ...DEMO_APPS.map((app) => ({
      label: app.label,
      subtitle: app.subtitle,
      icon: app.icon,
      path: app.basePath,
    })),
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Destination whose base path prefixes the current URL (defaults to docs). */
  protected readonly active = computed(
    () =>
      this.destinations.find((d) => this.url().startsWith(d.path)) ??
      this.destinations[0],
  );
}
