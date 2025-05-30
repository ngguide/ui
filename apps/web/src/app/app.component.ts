import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GuiSize } from '@ngguide/ui';

import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { FabComponent, GuiFabColor } from '@ngguide/ui/fab';
import { IconComponent } from '@ngguide/ui/icon';

@Component({
  imports: [RouterModule, ButtonComponent, FabComponent, IconComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  sizes: GuiSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  variants: GuiButtonVariant[] = [
    'filled',
    'elevated',
    'tonal',
    'outlined',
    'text',
  ];
  fabColors: GuiFabColor[] = ['primary', 'secondary', 'tertiary'];
  fabSizes: GuiSize[] = ['sm', 'md', 'lg'];
}
