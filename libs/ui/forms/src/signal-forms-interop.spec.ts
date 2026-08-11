import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { CheckboxComponent } from '@ngguide/ui/checkbox';
import { RadioComponent, RadioGroupComponent } from '@ngguide/ui/radio';

/**
 * Signal Forms (public API since Angular 22) reach our components through the
 * `ControlValueAccessor` that {@link GuiFormControl} provides as a host
 * directive. That path is not incidental: `FormField` picks its binding in a
 * fixed order — a control value accessor wins over the native
 * `FormValueControl` contract, which in turn wins over a plain form element.
 * Keeping the CVA is what lets one component serve template-driven, reactive
 * and signal forms at once, so these specs pin the interop down: drop the
 * accessor and signal forms would silently stop binding.
 */
@Component({
  imports: [CheckboxComponent, FormField],
  template: `<gui-checkbox [formField]="f.agree" />`,
})
class CheckboxHost {
  readonly model = signal({ agree: false });
  readonly f = form(this.model);
}

@Component({
  imports: [RadioGroupComponent, RadioComponent, FormField],
  template: `
    <gui-radio-group [formField]="f.plan">
      <gui-radio value="free" />
      <gui-radio value="pro" />
    </gui-radio-group>
  `,
})
class RadioHost {
  readonly model = signal({ plan: 'free' });
  readonly f = form(this.model);
}

@Component({
  imports: [CheckboxComponent, FormField],
  template: `<gui-checkbox [formField]="f.agree" />`,
})
class ValidatedCheckboxHost {
  readonly model = signal({ agree: false });
  readonly f = form(this.model, (path) => {
    required(path.agree);
  });
}

describe('signal forms interop', () => {
  it('writes the field value into the checkbox', () => {
    const fixture = TestBed.createComponent(CheckboxHost);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;

    fixture.componentInstance.f.agree().value.set(true);
    fixture.detectChanges();

    expect(native.checked).toBe(true);
  });

  it('writes a checkbox interaction back into the model', () => {
    const fixture = TestBed.createComponent(CheckboxHost);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;

    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.model().agree).toBe(true);
  });

  it('marks the field touched when the control is blurred', () => {
    const fixture = TestBed.createComponent(CheckboxHost);
    fixture.detectChanges();
    const native = fixture.nativeElement.querySelector(
      'input[type=checkbox]',
    ) as HTMLInputElement;
    expect(fixture.componentInstance.f.agree().touched()).toBe(false);

    native.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.f.agree().touched()).toBe(true);
  });

  it('surfaces schema validation on the field state', () => {
    const fixture = TestBed.createComponent(ValidatedCheckboxHost);
    fixture.detectChanges();
    const field = fixture.componentInstance.f.agree();

    // `required` on a false checkbox is unsatisfied, and the field knows it
    // even though the component renders the error styling from its own input.
    expect(field.invalid()).toBe(true);

    field.value.set(true);
    fixture.detectChanges();

    expect(field.invalid()).toBe(false);
  });

  it('binds a non-boolean control (radio group) through the same path', () => {
    const fixture = TestBed.createComponent(RadioHost);
    fixture.detectChanges();

    fixture.componentInstance.f.plan().value.set('pro');
    fixture.detectChanges();
    const radios = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type=radio]',
      ),
    ) as HTMLInputElement[];

    expect(radios.find((el) => el.checked)?.value).toBe('pro');
  });
});
