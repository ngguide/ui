import { Component } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiRichTooltip, GuiRichTooltipTrigger } from './rich-tooltip';

@Component({
  imports: [GuiRichTooltip, GuiRichTooltipTrigger],
  template: `
    <gui-rich-tooltip #rt>
      <span guiRichTooltipSubhead>Storage</span>
      Your files are encrypted at rest.
      <div guiRichTooltipActions>
        <button type="button" class="learn">Learn more</button>
      </div>
    </gui-rich-tooltip>
    <button
      type="button"
      class="trigger"
      [guiRichTooltipTrigger]="rt"
      [closeDelay]="0"
    >
      trigger
    </button>
  `,
})
class HostComponent {}

describe('GuiRichTooltip', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;

  function trigger(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      'button.trigger',
    ) as HTMLButtonElement;
  }
  function panel(): Element | null {
    return document.querySelector('.gui-rich-tooltip');
  }
  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('opens on pointer enter and projects subhead, body and actions', () => {
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();

    const p = panel();
    expect(p).not.toBeNull();
    expect(p?.getAttribute('role')).toBe('tooltip');
    expect(p?.querySelector('[guiRichTooltipSubhead]')?.textContent?.trim()).toBe(
      'Storage',
    );
    expect(p?.textContent).toContain('Your files are encrypted at rest.');
    expect(p?.querySelector('.learn')).not.toBeNull();
  });

  it('sets aria-describedby on the trigger while open', () => {
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();

    const describedBy = trigger().getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toBe(panel()?.id);
  });

  it('closes on Escape even when focus is outside the trigger', () => {
    // Open by hover with focus parked on another control: a host-scoped Escape
    // listener would never see the key, so this guards the document-scoped path.
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();
    expect(panel()).not.toBeNull();
    expect(document.activeElement).toBe(outside);

    outside.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-describedby')).toBeNull();

    outside.remove();
  });

  it('closes when the panel is clicked (e.g. an action)', () => {
    trigger().dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    flush();

    (panel()?.querySelector('.learn') as HTMLButtonElement).dispatchEvent(
      new Event('click', { bubbles: true }),
    );
    fixture.detectChanges();

    expect(panel()).toBeNull();
  });
});
