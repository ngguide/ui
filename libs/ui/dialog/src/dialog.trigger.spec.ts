import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiDialogTrigger } from './dialog.trigger';
import { GuiDialogConfig } from './dialog-config';

@Component({
  imports: [GuiDialogTrigger],
  template: `
    <button type="button" [guiDialogTrigger]="tpl" [guiDialogConfig]="config()">
      Open
    </button>
    <ng-template #tpl>
      <p class="trigger-body">Inline content</p>
    </ng-template>
  `,
})
class TriggerHost {
  readonly config = signal<GuiDialogConfig | undefined>({ ariaLabel: 'x' });
}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

const ESCAPE = 27;

/**
 * CDK's `DialogRef` keys off the (deprecated) `keyCode`, which jsdom's
 * constructor always leaves at 0 — real browsers populate it.
 */
function escape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
  });
  Object.defineProperty(event, 'keyCode', { get: () => ESCAPE });
  return event;
}

describe('GuiDialogTrigger', () => {
  function setup() {
    const fixture = TestBed.createComponent(TriggerHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    return { fixture, button };
  }

  it('opens the bound template on click (Req 7.2)', () => {
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('click'));
    flush();
    expect(document.querySelector('.trigger-body')?.textContent).toContain(
      'Inline content',
    );
  });

  it('closes on Escape (Req 12.4)', () => {
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('click'));
    flush();
    const container = document.querySelector('.gui-dialog-container');
    expect(container).not.toBeNull();

    container?.dispatchEvent(escape());
    flush();
    expect(document.querySelector('.gui-dialog-container')).toBeNull();
  });

  it('closes on scrim click (Req 12.5)', () => {
    const { button } = setup();
    button.dispatchEvent(new MouseEvent('click'));
    flush();
    const backdrop = document.querySelector(
      '.cdk-overlay-backdrop',
    ) as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click'));
    flush();
    expect(document.querySelector('.gui-dialog-container')).toBeNull();
  });

  it('disableClose suppresses Escape + scrim close (Req 12.4, 12.5)', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.config.set({ ariaLabel: 'x', disableClose: true });
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent('click'));
    flush();

    document.querySelector('.gui-dialog-container')?.dispatchEvent(escape());
    const backdrop = document.querySelector(
      '.cdk-overlay-backdrop',
    ) as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('click'));
    flush();
    expect(document.querySelector('.gui-dialog-container')).not.toBeNull();
  });
});
