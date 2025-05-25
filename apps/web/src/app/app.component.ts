import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UiComponent } from '@ngguide/ui';
import { greeting } from '@ngguide/ui/button';

@Component({
  imports: [RouterModule, UiComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = greeting;
}
