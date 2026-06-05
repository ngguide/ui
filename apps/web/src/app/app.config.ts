import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MENU_SCROLL_STRATEGY } from '@angular/cdk/menu';
import { Overlay } from '@angular/cdk/overlay';
import { provideM3Theme } from '@ngguide/ui/theme';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    // Close any open CDK menu (plain menus + the FAB menu) when the page
    // scrolls, instead of repositioning it — the overlay should not drift with
    // the content. The FAB menu also bakes this in at the component level.
    {
      provide: MENU_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
      deps: [Overlay],
    },
    // Dogfood M3 dynamic color: theme the whole UI Kit from a brand seed.
    // Runs on both server and client, so SSR output carries the dynamic tokens.
    provideM3Theme({
      sourceColor: '#6750A4',
      variant: 'tonal-spot',
      contrast: 'standard',
      mode: 'auto',
      customColors: [{ name: 'brand-success', value: '#2e7d32' }],
    }),
  ],
};
