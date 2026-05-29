import {
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  inject,
  type EnvironmentProviders,
} from '@angular/core';
import type { M3ThemeConfig } from './types';
import { M3ThemeService } from './theme.service';
import { validateConfig } from './validate';

/**
 * Configure M3 dynamic color at application bootstrap. The configured scheme is
 * applied on both the server and the client, so it is in effect for the first
 * render (Req 7.2, Req 10).
 *
 * Generation + application are synchronous, so a (sync)
 * `provideEnvironmentInitializer` is used rather than the async
 * `provideAppInitializer`. Invalid config fails fast at bootstrap (Req 9).
 */
export function provideM3Theme(config: M3ThemeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      validateConfig(config);
      inject(M3ThemeService).init(config);
    }),
  ]);
}
