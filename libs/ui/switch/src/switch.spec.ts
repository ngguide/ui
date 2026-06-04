import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch';

@Component({
  template: `<gui-switch [(checked)]="checked" [disabled]="disabled()"
    >Label</gui-switch
  >`,
  imports: [SwitchComponent],
})
class HostComponent {
  checked = signal<boolean | null>(false);
  disabled = signal(false);
}

describe('SwitchComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let input: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;
  });

  it('exposes role="switch" on the inner input', () => {
    expect(input.getAttribute('role')).toBe('switch');
  });

  it('toggles on/off and reflects aria-checked on click', () => {
    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
    expect(input.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles on Enter (M3 keyboard contract is Space or Enter)', () => {
    expect(host.checked()).toBe(false);

    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();

    expect(host.checked()).toBe(true);
    expect(input.getAttribute('aria-checked')).toBe('true');
  });

  it('blocks toggling when disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(input.disabled).toBe(true);

    input.click();
    fixture.detectChanges();

    expect(host.checked()).toBe(false);
  });
});
