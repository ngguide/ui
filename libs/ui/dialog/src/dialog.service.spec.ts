import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { GuiDialog } from './dialog.service';
import { GuiDialogHeadline } from './dialog';

@Component({
  imports: [GuiDialogHeadline],
  template: `<gui-dialog-headline>Title</gui-dialog-headline>
    <button type="button">ok</button>`,
})
class DialogContent {}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

describe('GuiDialog', () => {
  it('opens a basic dialog with role=alertdialog + aria-modal (Req 12.1, 14.1)', () => {
    // M3: basic dialogs are "alert dialogs" on web, so role defaults to
    // "alertdialog" unless the caller overrides it.
    const ref = TestBed.inject(GuiDialog).open(DialogContent, {
      ariaLabel: 'Test',
    });
    flush();
    const surface = document.querySelector('.gui-dialog-container');
    expect(surface?.getAttribute('role')).toBe('alertdialog');
    expect(surface?.getAttribute('aria-modal')).toBe('true');
    ref.close();
    flush();
    expect(document.querySelector('.gui-dialog-container')).toBeNull();
  });

  it('keeps role=dialog for full-screen dialogs unless overridden', () => {
    const ref = TestBed.inject(GuiDialog).open(DialogContent, {
      ariaLabel: 'Test',
      fullScreen: 'always',
    });
    flush();
    const surface = document.querySelector('.gui-dialog-container');
    expect(surface?.getAttribute('role')).toBe('dialog');
    ref.close();
    flush();
  });

  it('close(result) emits the result on closed (Req 16.2)', () => {
    const ref = TestBed.inject(GuiDialog).open<string>(DialogContent);
    let result: string | undefined;
    ref.closed.subscribe((r) => (result = r));
    flush();
    ref.close('done');
    flush();
    expect(result).toBe('done');
  });

  it('restores focus to the opener on close (Req 12.7)', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const ref = TestBed.inject(GuiDialog).open(DialogContent, {
      ariaLabel: 'x',
    });
    flush();
    ref.close();
    flush();
    // CDK restores focus asynchronously after teardown.
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('throws when opened without content', () => {
    expect(() =>
      TestBed.inject(GuiDialog).open(null as never),
    ).toThrowError(/component type or a TemplateRef/);
  });

  describe('fullScreen', () => {
    // GuiBreakpoint calls addEventListener via optional chaining, so the mock
    // can omit it entirely.
    class FakeMql {
      constructor(public matches: boolean) {}
    }

    function configureCompact(matches: boolean): void {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: MediaMatcher,
            useValue: { matchMedia: () => new FakeMql(matches) },
          },
        ],
      });
    }

    it('compact mode goes full-screen only on a compact viewport (Req 8.1)', () => {
      configureCompact(true);
      const ref = TestBed.inject(GuiDialog).open(DialogContent, {
        fullScreen: 'compact',
        ariaLabel: 'x',
      });
      flush();
      expect(
        document
          .querySelector('.gui-dialog-container')
          ?.hasAttribute('data-fullscreen'),
      ).toBe(true);
      ref.close();
      flush();
    });

    it('compact mode stays basic on a wide viewport (Req 8.1)', () => {
      configureCompact(false);
      const ref = TestBed.inject(GuiDialog).open(DialogContent, {
        fullScreen: 'compact',
        ariaLabel: 'x',
      });
      flush();
      expect(
        document
          .querySelector('.gui-dialog-container')
          ?.hasAttribute('data-fullscreen'),
      ).toBe(false);
      ref.close();
      flush();
    });
  });
});
