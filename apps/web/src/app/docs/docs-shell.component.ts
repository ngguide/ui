import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { IconComponent } from '@ngguide/ui/icon';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { SwitchComponent } from '@ngguide/ui/switch';
import { GuiTooltip } from '@ngguide/ui/tooltip';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';

import { ThemeController } from '../shell/theme-controller';
import { DOC_CATEGORIES } from './component-registry';

/**
 * Standalone documentation-site chrome (`/ui`) — a deliberate mimic of the
 * Material Design 3 site: a slim top app bar (brand · theme · brand-seed ·
 * GitHub) and a persistent left sidebar listing every component grouped by the
 * same categories as the spec docs, with the routed component page in between.
 *
 * It reuses the demo app's root {@link ThemeController}, so the dark-mode switch
 * and dynamic-color seed picker drive the whole `--md-sys-*` token set live —
 * the entire site re-themes the way the kit is meant to.
 */
@Component({
  selector: 'app-docs-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CdkMenu,
    CdkMenuTrigger,
    IconComponent,
    IconButtonComponent,
    SwitchComponent,
    GuiTooltip,
    MenuDirective,
    MenuItemComponent,
  ],
  template: `
    <header class="docs-bar">
      <a class="docs-brand" routerLink="/ui">
        <span class="docs-brand-mark">M3</span>
        <span class="docs-brand-name">ngguide&nbsp;UI</span>
      </a>
      <span class="docs-bar-spacer"></span>

      <button
        gui-icon-button
        variant="standard"
        [cdkMenuTriggerFor]="seedMenu"
        aria-label="Brand color"
        guiTooltip="Brand color"
      >
        <gui-icon class="sym">palette</gui-icon>
      </button>

      <gui-switch
        class="docs-dark"
        aria-label="Dark theme"
        guiTooltip="Toggle dark theme"
        [checked]="theme.isDark()"
        (checkedChange)="theme.setMode($event === true ? 'dark' : 'light')"
      >
        <gui-icon class="sym" guiSwitchIcon>light_mode</gui-icon>
        <gui-icon class="sym" guiSwitchSelectedIcon>dark_mode</gui-icon>
      </gui-switch>

      <a
        gui-icon-button
        variant="standard"
        href="https://github.com/ngguide/ui"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        guiTooltip="GitHub"
      >
        <gui-icon class="sym">code</gui-icon>
      </a>
    </header>

    <div class="docs-body">
      <nav class="docs-sidebar" aria-label="Components">
        <a
          class="docs-side-home"
          routerLink="/ui"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: true }"
        >
          <gui-icon class="sym">home</gui-icon>
          Overview
        </a>
        @for (category of categories; track category.id) {
          <p class="docs-side-group">{{ category.title }}</p>
          @for (component of category.components; track component.slug) {
            <a
              class="docs-side-link"
              [routerLink]="['/ui/components', component.slug]"
              routerLinkActive="is-active"
            >
              {{ component.name }}
            </a>
          }
        }
      </nav>

      <main class="docs-content" id="docs-content">
        <router-outlet />
      </main>
    </div>

    <ng-template #seedMenu>
      <div gui-menu cdkMenu class="docs-seed-menu">
        @for (s of theme.seeds; track s.value) {
          <button gui-menu-item (click)="theme.setSeed(s.value)">
            <span
              class="docs-seed-dot"
              [style.background]="s.value"
            ></span>
            {{ s.name }}
          </button>
        }
      </div>
    </ng-template>
  `,
  styleUrl: './docs-shell.component.css',
  host: { class: 'app-docs-shell' },
})
export class DocsShellComponent {
  protected readonly theme = inject(ThemeController);
  protected readonly categories = DOC_CATEGORIES;
}
