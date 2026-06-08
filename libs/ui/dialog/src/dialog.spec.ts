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

  describe('accessible name & description (M3 Labeling elements)', () => {
    it('names a basic dialog from its headline when no ariaLabel is given', () => {
      const ref = TestBed.inject(GuiDialog).open(BasicContent);
      flush();
      const surface = document.querySelector('.gui-dialog-container');
      const labelledby = surface?.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      const headline = surface?.querySelector('gui-dialog-headline');
      expect(headline?.id).toBe(labelledby);
      expect(document.getElementById(labelledby ?? '')?.textContent?.trim()).toBe(
        'Reset settings?',
      );
      // No explicit name was passed, so aria-label stays unset.
      expect(surface?.getAttribute('aria-label')).toBeNull();
      ref.close();
      flush();
    });

    it('describes a basic dialog from its content region', () => {
      const ref = TestBed.inject(GuiDialog).open(BasicContent);
      flush();
      const surface = document.querySelector('.gui-dialog-container');
      const describedby = surface?.getAttribute('aria-describedby');
      expect(describedby).toBeTruthy();
      const content = surface?.querySelector('gui-dialog-content');
      expect(content?.id).toBe(describedby);
      ref.close();
      flush();
    });

    it('lets an explicit ariaLabel win over the headline auto-name', () => {
      const ref = TestBed.inject(GuiDialog).open(BasicContent, {
        ariaLabel: 'Reset',
      });
      flush();
      const surface = document.querySelector('.gui-dialog-container');
      expect(surface?.getAttribute('aria-label')).toBe('Reset');
      expect(surface?.getAttribute('aria-labelledby')).toBeNull();
      ref.close();
      flush();
    });

    it('names a full-screen dialog from its header title', () => {
      const ref = TestBed.inject(GuiDialog).open(FullscreenContent, {
        fullScreen: 'always',
      });
      flush();
      const surface = document.querySelector('.gui-dialog-container');
      const labelledby = surface?.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      const title = surface?.querySelector('.gui-dialog-fs-title');
      expect(title?.id).toBe(labelledby);
      expect(document.getElementById(labelledby ?? '')?.textContent?.trim()).toBe(
        'Edit profile',
      );
      ref.close();
      flush();
    });
  });

  describe('reduced motion', () => {
    it('disables the enter animation (Req 15.2)', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: MediaMatcher,
            useValue: {
              // addEventListener is invoked via optional chaining, so it can
              // be omitted from the mock.
              matchMedia: (q: string) => ({
                matches: q.includes('prefers-reduced-motion'),
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
