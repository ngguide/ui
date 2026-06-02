import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CdkMenu } from '@angular/cdk/menu';
import { GuiSize } from '@ngguide/ui';
import { M3ThemeService } from '@ngguide/ui/theme';

import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { ButtonGroupComponent } from '@ngguide/ui/button-group';
import {
  ExtendedFabComponent,
  FabComponent,
  GuiFabColor,
  GuiFabSize,
} from '@ngguide/ui/fab';
import { FabMenuComponent, FabMenuItemComponent } from '@ngguide/ui/fab-menu';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiIconButtonVariant,
  IconButtonComponent,
} from '@ngguide/ui/icon-button';
import {
  SegmentedButtonComponent,
  SegmentedButtonGroupComponent,
} from '@ngguide/ui/segmented-button';
import { InteractionDemoComponent } from './interaction-demo.component';

@Component({
  imports: [
    RouterModule,
    ButtonComponent,
    ButtonGroupComponent,
    FabComponent,
    ExtendedFabComponent,
    FabMenuComponent,
    FabMenuItemComponent,
    CdkMenu,
    IconComponent,
    IconButtonComponent,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    InteractionDemoComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly theme = inject(M3ThemeService);

  /** Demo brand seeds to exercise runtime re-theming (Req 7.3). */
  readonly brandSeeds = ['#6750A4', '#00629D', '#B3261E'];

  /** Re-theme the running app from a brand seed color. */
  applyBrand(seed: string): void {
    this.theme.setTheme({
      sourceColor: seed,
      variant: 'tonal-spot',
      contrast: 'standard',
      mode: 'auto',
      customColors: [{ name: 'brand-success', value: '#2e7d32' }],
    });
  }

  sizes: GuiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  variants: GuiButtonVariant[] = [
    'filled',
    'elevated',
    'tonal',
    'outlined',
    'text',
  ];

  /** Selected state for the toggle button demo. */
  bold = false;
  italic = false;
  underline = false;
  fabColors: GuiFabColor[] = [
    'primary-container',
    'secondary-container',
    'tertiary-container',
  ];
  fabSizes: GuiFabSize[] = ['sm', 'md', 'lg'];

  iconButtonVariants: GuiIconButtonVariant[] = [
    'standard',
    'filled',
    'tonal',
    'outlined',
  ];

  /** Selected state for the toggle icon button demo. */
  favorite = false;

  /** Single-select segmented buttons demo. */
  alignment: string | null = 'center';

  /** Multi-select segmented buttons demo. */
  weekdays: string[] = ['mon'];
}
