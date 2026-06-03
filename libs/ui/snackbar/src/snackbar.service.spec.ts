import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  GuiSnackbarCloseReason,
  inferTwoLine,
  normalizeSnackbarConfig,
} from './snackbar-config';
import { GuiSnackbar } from './snackbar.service';

describe('normalizeSnackbarConfig', () => {
  it('wraps a string into a config and applies defaults', () => {
    const { config, data } = normalizeSnackbarConfig('Saved');
    expect(config.message).toBe('Saved');
    expect(data.showClose).toBe(false);
    expect(data.message).toBe('Saved');
  });

  it('infers two lines from message length, honoring an explicit flag', () => {
    expect(inferTwoLine({ message: 'short' })).toBe(false);
    expect(inferTwoLine({ message: 'x'.repeat(60) })).toBe(true);
    expect(inferTwoLine({ message: 'x'.repeat(60), twoLine: false })).toBe(
      false,
    );
  });
});

describe('GuiSnackbar', () => {
  let service: GuiSnackbar;

  function surfaces(): NodeListOf<Element> {
    return document.querySelectorAll('gui-snackbar');
  }
  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  beforeEach(() => {
    service = TestBed.inject(GuiSnackbar);
  });

  afterEach(() => {
    service.dismissAll();
  });

  it('shows a single snackbar with the message', () => {
    service.open('Saved');
    flush();

    expect(surfaces().length).toBe(1);
    expect(
      document.querySelector('.gui-snackbar-label')?.textContent?.trim(),
    ).toBe('Saved');
  });

  it('announces the message politely', () => {
    const announcer = TestBed.inject(LiveAnnouncer);
    const spy = vi.spyOn(announcer, 'announce');

    service.open('Profile updated');

    expect(spy).toHaveBeenCalledWith('Profile updated', 'polite');
  });

  it('shows one at a time and reveals the next after dismissal (FIFO)', () => {
    const first = service.open('First');
    service.open('Second');
    flush();

    // Only one surface is shown while the first is active.
    expect(surfaces().length).toBe(1);
    expect(
      document.querySelector('.gui-snackbar-label')?.textContent?.trim(),
    ).toBe('First');

    first.dismiss('programmatic');
    flush();

    expect(surfaces().length).toBe(1);
    expect(
      document.querySelector('.gui-snackbar-label')?.textContent?.trim(),
    ).toBe('Second');
  });

  it('reports the close reason through afterDismissed', () => {
    const ref = service.open('Saved');
    let reason: GuiSnackbarCloseReason | undefined;
    ref.afterDismissed.subscribe((r) => (reason = r));

    ref.dismiss('programmatic');

    expect(reason).toBe('programmatic');
  });

  it('emits onAction and dismisses with reason "action"', () => {
    const ref = service.open({ message: 'Deleted', action: 'Undo' });
    let actioned = false;
    let reason: GuiSnackbarCloseReason | undefined;
    ref.onAction.subscribe(() => (actioned = true));
    ref.afterDismissed.subscribe((r) => (reason = r));

    // Drive the action through the controller surface API.
    (ref as unknown as { activateAction(): void }).activateAction();

    expect(actioned).toBe(true);
    expect(reason).toBe('action');
  });

  it('auto-dismisses after the default duration', () => {
    vi.useFakeTimers();
    try {
      const ref = service.open({ message: 'Saved' });
      let reason: GuiSnackbarCloseReason | undefined;
      ref.afterDismissed.subscribe((r) => (reason = r));

      vi.advanceTimersByTime(5000);

      expect(reason).toBe('timeout');
    } finally {
      vi.useRealTimers();
    }
  });

  it('never auto-dismisses when duration is null', () => {
    vi.useFakeTimers();
    try {
      const ref = service.open({ message: 'Action required', duration: null });
      let dismissed = false;
      ref.afterDismissed.subscribe(() => (dismissed = true));

      vi.advanceTimersByTime(60000);

      expect(dismissed).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('dismissAll clears the queue and closes the current', () => {
    const first = service.open('First');
    const second = service.open('Second');
    let firstReason: GuiSnackbarCloseReason | undefined;
    let secondReason: GuiSnackbarCloseReason | undefined;
    first.afterDismissed.subscribe((r) => (firstReason = r));
    second.afterDismissed.subscribe((r) => (secondReason = r));
    flush();

    service.dismissAll();
    flush();

    expect(firstReason).toBe('programmatic');
    expect(secondReason).toBe('programmatic');
    expect(surfaces().length).toBe(0);
  });
});
