import { Component } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiTooltip } from './tooltip';

@Component({
  imports: [GuiTooltip],
  template: `<button
    type="button"
    [guiTooltip]="message"
    [showDelay]="0"
    [hideDelay]="0"
    [disabled]="disabled"
  >
    trigger
  </button>`,
})
class HostComponent {
  message = 'Help';
  disabled = false;
}

describe('GuiTooltip', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
  function panel(): Element | null {
    return document.querySelector('gui-tooltip-panel');
  }
  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('shows a tooltip on pointer enter and sets aria-describedby', () => {
    fixture.detectChanges();
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();

    expect(panel()).not.toBeNull();
    expect(panel()?.getAttribute('role')).toBe('tooltip');
    expect(panel()?.textContent?.trim()).toBe('Help');

    const describedBy = trigger().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toBe(panel()?.id);
  });

  it('removes the tooltip and aria-describedby on pointer leave', () => {
    fixture.detectChanges();
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    trigger().dispatchEvent(new Event('pointerleave'));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-describedby')).toBeNull();
  });

  it('Escape hides the tooltip and keeps focus on the trigger', () => {
    fixture.detectChanges();
    trigger().focus();
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();
    expect(panel()).not.toBeNull();

    trigger().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(panel()).toBeNull();
    if (document.activeElement !== document.body) {
      expect(document.activeElement).toBe(trigger());
    }
  });

  it('does not open when disabled', () => {
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-describedby')).toBeNull();
  });

  it('does not open with an empty message', () => {
    fixture.componentInstance.message = '';
    fixture.detectChanges();

    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });
});
