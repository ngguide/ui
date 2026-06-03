import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiBadge } from './badge';

@Component({
  imports: [GuiBadge],
  template: `<button
    [guiBadge]="value"
    [guiBadgeMax]="max"
    [guiBadgeHidden]="hidden"
  >
    host
  </button>`,
})
class HostComponent {
  value: number | string | null = null;
  max = 999;
  hidden = false;
}

describe('GuiBadge', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let host: HostComponent;

  function hostEl(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }
  function badgeEl(): HTMLSpanElement | null {
    return fixture.nativeElement.querySelector('.gui-badge');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  it('renders a small dot with no text when there is no value', () => {
    fixture.detectChanges();

    expect(hostEl().getAttribute('data-gui-badge-variant')).toBe('small');
    expect(badgeEl()).not.toBeNull();
    expect(badgeEl()?.textContent?.trim()).toBe('');
  });

  it('renders a large numeric badge when a value is present', () => {
    host.value = 3;
    fixture.detectChanges();

    expect(hostEl().getAttribute('data-gui-badge-variant')).toBe('large');
    expect(badgeEl()?.textContent?.trim()).toBe('3');
  });

  it('caps the value as "{max}+" when it exceeds max', () => {
    host.value = 1500;
    fixture.detectChanges();

    expect(badgeEl()?.textContent?.trim()).toBe('999+');
  });

  it('marks the badge graphic aria-hidden', () => {
    fixture.detectChanges();

    expect(badgeEl()?.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets data-gui-badge-hidden on the host when hidden', () => {
    host.value = 5;
    host.hidden = true;
    fixture.detectChanges();

    expect(hostEl().getAttribute('data-gui-badge-hidden')).toBe('true');
  });

  it('treats an empty string value as a dot', () => {
    host.value = '';
    fixture.detectChanges();

    expect(hostEl().getAttribute('data-gui-badge-variant')).toBe('small');
  });
});
