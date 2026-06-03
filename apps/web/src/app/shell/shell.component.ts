import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y';
import { Subscription, filter, map } from 'rxjs';
import { createRovingFocus } from '@ngguide/ui/interaction';

import { IconComponent } from '@ngguide/ui/icon';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { SwitchComponent } from '@ngguide/ui/switch';
import { GuiBadge } from '@ngguide/ui/badge';
import { GuiTooltip } from '@ngguide/ui/tooltip';
import {
  MenuDirective,
  MenuDividerComponent,
  MenuItemComponent,
} from '@ngguide/ui/menu';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
} from '@ngguide/ui/text-field';

import { DEMO_APPS } from './nav';
import { ThemeController } from './theme-controller';
import { NavRailItemComponent } from './nav-rail-item.component';

/**
 * Persistent demo chrome: a top app bar (app switcher · search · theme · brand ·
 * notifications · account), an adaptive navigation surface (vertical rail when
 * expanded ↔ bottom bar when compact, switched by a CSS container query — no JS,
 * SSR-safe), and the routed content outlet. Stays mounted across in-session
 * navigation, so the {@link ThemeController}'s mode/seed persist (R7.3).
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CdkMenu,
    CdkMenuTrigger,
    FormsModule,
    IconComponent,
    IconButtonComponent,
    SwitchComponent,
    GuiBadge,
    GuiTooltip,
    MenuDirective,
    MenuItemComponent,
    MenuDividerComponent,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    NavRailItemComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  host: { class: 'app-shell' },
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly theme = inject(ThemeController);

  /** Current URL as a signal (seeded with the initial URL, updated on each navigation). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly apps = DEMO_APPS;

  protected readonly activeApp = computed(
    () => this.apps.find((a) => this.url().startsWith(a.basePath)) ?? this.apps[0],
  );

  protected readonly activeSection = computed(() =>
    this.activeApp().nav.find((n) => this.url().startsWith(n.path)),
  );

  /** Decorative global search bound to a signal (per-screen search is local). */
  protected readonly query = signal('');

  // ── Roving tab stop over the navigation rail (interaction coverage, R10) ────
  private readonly railItems = viewChildren(NavRailItemComponent);
  private manager?: FocusKeyManager<FocusableOption>;
  private changeSub?: Subscription;

  constructor() {
    afterNextRender(() => this.rebuildRoving());
    // Rebuild when the active app changes (the rail's destinations change).
    effect(() => {
      this.railItems();
      this.activeApp();
      if (this.manager) {
        this.rebuildRoving();
      }
    });
  }

  protected onRailKeydown(event: KeyboardEvent): void {
    this.manager?.onKeydown(event);
  }

  protected setMode(dark: boolean): void {
    this.theme.setMode(dark ? 'dark' : 'light');
  }

  private rebuildRoving(): void {
    const items = this.railItems();
    if (items.length === 0) {
      return;
    }
    this.changeSub?.unsubscribe();
    this.manager = createRovingFocus(items as readonly FocusableOption[], {
      orientation: 'vertical',
    });
    this.changeSub = this.manager.change
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => items.forEach((it, i) => it.setActive(i === index)));
    this.manager.updateActiveItem(0);
    items.forEach((it, i) => it.setActive(i === 0));
  }
}
