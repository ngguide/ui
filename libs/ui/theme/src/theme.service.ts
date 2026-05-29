import { Injectable, signal, inject } from '@angular/core';
import type { M3ThemeConfig, M3Contrast, M3ResolvedRoles } from './types';
import { generateScheme, type GeneratedScheme } from './engine';
import { buildCss } from './css-builder';
import { M3StyleApplier } from './style-applier';
import { validateConfig } from './validate';

/**
 * Owns the active M3 dynamic-color scheme: validates a config, generates the
 * scheme, serializes it to CSS, and applies it via {@link M3StyleApplier}. The
 * same instance is reused at bootstrap (`init`) and at runtime (`setTheme`).
 */
@Injectable({ providedIn: 'root' })
export class M3ThemeService {
  private readonly applier = inject(M3StyleApplier);
  private readonly _config = signal<M3ThemeConfig | null>(null);
  private _scheme: GeneratedScheme | null = null;

  /** Current config (read-only signal). */
  readonly config = this._config.asReadonly();

  /**
   * Validate, generate, and apply a config (Req 6, 7.3). Fail-fast on invalid
   * input (Req 9) — nothing is applied if validation throws.
   */
  setTheme(config: M3ThemeConfig): void {
    validateConfig(config);
    const scheme = generateScheme(config);
    this._scheme = scheme;
    this._config.set(config);
    this.applier.apply(buildCss(scheme, config.mode ?? 'auto'));
  }

  /** Called by the bootstrap initializer with the provided config (Req 7.2). */
  init(config: M3ThemeConfig): void {
    this.setTheme(config);
  }

  /**
   * Read computed values without needing them applied (Req 8). Returns a flat
   * role→hex map for a specific mode + contrast (defaults: `light`, the active
   * config's contrast). The values equal what the applied token contract
   * resolves to for that mode/contrast (Req 8.3).
   */
  resolve(opts?: { mode?: 'light' | 'dark'; contrast?: M3Contrast }): M3ResolvedRoles {
    const config = this._config();
    if (!this._scheme || !config) {
      throw new Error('M3 dynamic color: resolve() called before a theme was applied');
    }
    const contrast = opts?.contrast ?? config.contrast ?? 'standard';
    const mode = opts?.mode ?? 'light';
    const scope = this._scheme[contrast];

    const roles: M3ResolvedRoles = {};
    for (const [token, pair] of Object.entries(scope)) {
      roles[token] = pair[mode];
    }
    return roles;
  }
}
