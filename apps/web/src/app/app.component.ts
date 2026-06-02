import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GuiSize } from '@ngguide/ui';
import { M3ThemeService } from '@ngguide/ui/theme';

import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { FabComponent, GuiFabColor } from '@ngguide/ui/fab';
import { IconComponent } from '@ngguide/ui/icon';
import { InteractionDemoComponent } from './interaction-demo.component';

@Component({
  imports: [
    RouterModule,
    ButtonComponent,
    FabComponent,
    IconComponent,
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
  fabColors: GuiFabColor[] = ['primary', 'secondary', 'tertiary'];
  fabSizes: GuiSize[] = ['sm', 'md', 'lg'];
}
