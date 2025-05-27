import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GuiSize } from '@ngguide/ui';

import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';

@Component({
  imports: [RouterModule, ButtonComponent],
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
}
