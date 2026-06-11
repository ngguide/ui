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

  it('floats the label for a pre-filled value without an input event', () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.val.set('preset');
    f.detectChanges(); // writes [value] + runs the afterEveryRender sync
    f.detectChanges(); // host binding reflects the now-populated state
    const r = f.nativeElement.querySelector('gui-text-field') as HTMLElement;
    expect(r.getAttribute('data-populated')).toBe('');
  });

  it('enforces the native maxlength when maxLength is set', () => {
    expect(input.getAttribute('maxlength')).toBe('10');
  });

  it('focuses the input when the field body is clicked', () => {
    const container = root.querySelector(
      '.gui-text-field-container',
    ) as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(document.activeElement).toBe(input);
  });
});

@Component({
  template: `<gui-text-field [supportingText]="'Help text'">
    <input guiTextFieldInput aria-describedby="consumer-desc" />
  </gui-text-field>`,
  imports: [TextFieldComponent, TextFieldInputDirective],
})
class DescribedByHostComponent {}

describe('TextFieldComponent aria-describedby', () => {
  it('preserves a consumer-supplied aria-describedby alongside its own', () => {
    const fixture = TestBed.createComponent(DescribedByHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const tokens = (input.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(tokens).toContain('consumer-desc');
    expect(tokens.some((t) => t.startsWith('gui-tf-supporting-'))).toBe(true);
  });
});
