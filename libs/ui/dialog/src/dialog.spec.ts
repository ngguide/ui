import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { GuiDialog } from './dialog.service';
import {
  GuiDialogActions,
  GuiDialogContent,
  GuiDialogFullscreenHeader,
  GuiDialogHeadline,
  GuiDialogIcon,
} from './dialog';

@Component({
  imports: [
    GuiDialogIcon,
    GuiDialogHeadline,
    GuiDialogContent,
    GuiDialogActions,
  ],
  template: `
    <gui-dialog-icon>!</gui-dialog-icon>
    <gui-dialog-headline>Reset settings?</gui-dialog-headline>
    <gui-dialog-content>This cannot be undone.</gui-dialog-content>
    <gui-dialog-actions>
      <button type="button">Cancel</button>
      <button type="button">Reset</button>
    </gui-dialog-actions>
  `,
})
class BasicContent {}

@Component({
  imports: [GuiDialogFullscreenHeader],
  template: `
    <gui-dialog-fullscreen-header>
      <button guiDialogClose type="button">Close</button>
      Edit profile
      <button guiDialogConfirm type="button">Save</button>
    </gui-dialog-fullscreen-header>
  `,
})
class FullscreenContent {}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

describe('GuiDialogContainer', () => {
  it('renders the M3 anatomy slots (Req 7.1)', () => {
    const ref = TestBed.inject(GuiDialog).open(BasicContent, {
      ariaLabel: 'Reset',
    });
    flush();
    const surface = document.querySelector('.gui-dialog-container');
    expect(surface?.querySelector('gui-dialog-icon')).not.toBeNull();
    expect(
      surface?.querySelector('gui-dialog-headline')?.getAttribute('role'),
    ).toBe('heading');
    expect(surface?.querySelector('gui-dialog-content')).not.toBeNull();
    expect(surface?.querySelector('gui-dialog-actions')).not.toBeNull();
    ref.close();
    flush();
  });

  it('marks the surface full-screen and renders the header (Req 8.1, 8.2)', () => {
    const ref = TestBed.inject(GuiDialog).open(FullscreenContent, {
      fullScreen: 'always',
      ariaLabel: 'Edit',
    });
    flush();
    const surface = document.querySelector('.gui-dialog-container');
    expect(surface?.hasAttribute('data-fullscreen')).toBe(true);
    expect(
      surface?.querySelector('gui-dialog-fullscreen-header'),
    ).not.toBeNull();
    ref.close();
    flush();
  });

  describe('reduced motion', () => {
    it('disables the enter animation (Req 15.2)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: MediaMatcher,
            useValue: {
              matchMedia: (q: string) => ({
                matches: q.includes('prefers-reduced-motion'),
                addEventListener: () => {},
              }),
            },
          },
        ],
      });
      const ref = TestBed.inject(GuiDialog).open(BasicContent, {
        ariaLabel: 'x',
      });
      flush();
      const surface = document.querySelector('.gui-dialog-container');
      expect(surface?.classList.contains('gui-no-motion')).toBe(true);
      ref.close();
      flush();
    });
  });
});
