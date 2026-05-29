import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideM3Theme } from '@ngguide/ui/theme';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
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
