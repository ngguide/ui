import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextFieldComponent } from './text-field';
import { TextFieldInputDirective } from './text-field-input';

@Component({
  template: `<gui-text-field
    [variant]="variant()"
    [label]="'Name'"
    [error]="error()"
    [errorText]="'Required'"
    [maxLength]="10"
    ><input guiTextFieldInput [value]="val()"
  /></gui-text-field>`,
  imports: [TextFieldComponent, TextFieldInputDirective],
})
class HostComponent {
  variant = signal<'filled' | 'outlined'>('filled');
  error = signal(false);
  val = signal('');
}

describe('TextFieldComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let root: HTMLElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement.querySelector(
      'gui-text-field',
    ) as HTMLElement;
    input = fixture.nativeElement.querySelector(
      'input[guiTextFieldInput]',
    ) as HTMLInputElement;
  });

  it('renders the container', () => {
    expect(root).toBeTruthy();
    expect(
      root.querySelector('.gui-text-field-container'),
    ).toBeTruthy();
  });

  it('toggles data-populated when the value is set', () => {
    expect(root.getAttribute('data-populated')).toBeNull();

    host.val.set('abc');
    fixture.detectChanges();
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(root.getAttribute('data-populated')).toBe('');
  });

  it('sets data-focused when the input is focused', () => {
    expect(root.getAttribute('data-focused')).toBeNull();

    input.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    expect(root.getAttribute('data-focused')).toBe('');

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(root.getAttribute('data-focused')).toBeNull();
  });

  it('reflects error: data-error, error text and aria-invalid', () => {
    host.error.set(true);
    fixture.detectChanges();

    expect(root.getAttribute('data-error')).toBe('');
    expect(root.textContent).toContain('Required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows the character counter N/10', () => {
    input.value = 'abcd';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const counter = root.querySelector('.gui-text-field-counter');
    expect(counter?.textContent?.trim()).toBe('4/10');
  });

  it('names the input via aria-labelledby referencing the label', () => {
    const label = root.querySelector('.gui-text-field-label') as HTMLElement;
    expect(label.id).toBeTruthy();
    expect(input.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('reflects variant=outlined', () => {
    host.variant.set('outlined');
    fixture.detectChanges();

    expect(root.getAttribute('data-variant')).toBe('outlined');
  });
});
