import { Subject } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import {
  GUI_DIALOG_DATA,
  asArray,
  normalizeModalConfig,
  wrapDialogRef,
} from './modal';
import { DIALOG_DATA } from '@angular/cdk/dialog';

describe('normalizeModalConfig', () => {
  it('applies the M3 modal defaults (Req 12.1–12.3, 12.7, 14.1)', () => {
    const cfg = normalizeModalConfig();
    expect(cfg.role).toBe('dialog');
    expect(cfg.ariaModal).toBe(true);
    expect(cfg.hasBackdrop).toBe(true);
    expect(cfg.backdropClass).toBe('gui-scrim');
    expect(cfg.autoFocus).toBe('first-tabbable');
    expect(cfg.restoreFocus).toBe(true);
    expect(cfg.disableClose).toBe(false);
    // Scroll-lock relies on CDK Dialog's default block scroll strategy
    // (Req 12.6) — the normalizer does not override scrollStrategy.
    expect(cfg.scrollStrategy).toBeUndefined();
  });

  it('propagates caller overrides', () => {
    const cfg = normalizeModalConfig({
      role: 'alertdialog',
      disableClose: true,
      ariaLabel: 'Delete file?',
      autoFocus: 'first-heading',
      restoreFocus: false,
    });
    expect(cfg.role).toBe('alertdialog');
    expect(cfg.disableClose).toBe(true);
    expect(cfg.ariaLabel).toBe('Delete file?');
    expect(cfg.autoFocus).toBe('first-heading');
    expect(cfg.restoreFocus).toBe(false);
  });

  it('normalizes panelClass to an array', () => {
    expect(normalizeModalConfig({ panelClass: 'x' }).panelClass).toEqual(['x']);
    expect(normalizeModalConfig({ panelClass: ['x', 'y'] }).panelClass).toEqual([
      'x',
      'y',
    ]);
    expect(normalizeModalConfig().panelClass).toEqual([]);
  });
});

describe('asArray', () => {
  it('wraps singletons and passes arrays through', () => {
    expect(asArray(undefined)).toEqual([]);
    expect(asArray('a')).toEqual(['a']);
    expect(asArray(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('wrapDialogRef', () => {
  it('forwards close(result) onto the CDK ref and re-exposes closed', () => {
    const closed = new Subject<string | undefined>();
    let closedWith: string | undefined;
    const fake = {
      closed,
      backdropClick: new Subject<MouseEvent>(),
      keydownEvents: new Subject<KeyboardEvent>(),
      close: (result?: string) => {
        closedWith = result;
        closed.next(result);
      },
    } as unknown as DialogRef<string, unknown>;

    const ref = wrapDialogRef<string>(fake);
    let received: string | undefined;
    ref.closed.subscribe((r) => (received = r));

    ref.close('ok');
    expect(closedWith).toBe('ok');
    expect(received).toBe('ok');
  });
});

describe('GUI_DIALOG_DATA', () => {
  it('re-exports the CDK DIALOG_DATA token', () => {
    expect(GUI_DIALOG_DATA).toBe(DIALOG_DATA);
  });
});
