import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChildren,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@ngguide/ui/icon';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 text field (`@ngguide/ui/text-field`).
 *
 * Per the strict-M3 reference (m3.material.io/components/text-fields) the text
 * field has exactly TWO variants — `filled` and `outlined` — and a SINGLE size
 * (56dp container) and corner treatment (no size/shape sweep to enumerate).
 * What DOES vary is the rich set of configurations and states the spec lists:
 * empty vs. populated, focused/hovered (interaction, shown live), disabled,
 * error, leading/trailing icons, prefix/suffix, supporting text, character
 * counter and the multi-line (textarea) form.
 *
 * The implemented component is a PRESENTATIONAL WRAPPER (decision 1B / deviation
 * D1): it draws no value accessor itself. The consumer authors their own
 * `<input>`/`<textarea>`, marks it `[guiTextFieldInput]` (the
 * `TextFieldInputDirective`), and keeps their own `ngModel`/`formControl` on the
 * native element. The wrapper observes that directive's `focused`/`empty`
 * signals to draw M3 chrome. Optional icons are projected via the
 * `[guiTextFieldLeading]` / `[guiTextFieldTrailing]` marker directives.
 *
 * Wrapper inputs exercised below: `variant` ('filled' | 'outlined'), `label`,
 * `supportingText`, `errorText`, `error`, `required`, `prefix`, `suffix`,
 * `maxLength`.
 *
 * Populated specimens are seeded through `[(ngModel)]`; because the input
 * directive only flips its `empty` signal on the native `(input)` event, the
 * seeded specimens are synced once after render (set `empty` from the real DOM
 * value) so their floating label sits in the populated position at rest. This is
 * deterministic — fixed seed strings, no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    IconComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Text field"
      entry="@ngguide/ui/text-field"
      docHref="https://m3.material.io/components/text-fields"
    >
      <!-- The two M3 variants, empty and populated. -->
      <app-demo-block
        heading="Variants"
        hint="The two M3 variants — filled and outlined — empty and populated"
        [column]="true"
      >
        <app-demo-specimen label="filled (empty)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput [(ngModel)]="empty1" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="filled (populated)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput #seed [(ngModel)]="filledValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined (empty)" class="fill">
          <gui-text-field variant="outlined" label="Label">
            <input guiTextFieldInput [(ngModel)]="empty2" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined (populated)" class="fill">
          <gui-text-field variant="outlined" label="Label">
            <input guiTextFieldInput #seed [(ngModel)]="outlinedValue" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- M3 lists a single 56dp container height / target size for both
           variants — there is no size enumeration to sweep. -->
      <app-demo-block
        heading="Size"
        hint="A single M3 size — 56dp container height (target size) for both variants"
        [column]="true"
      >
        <app-demo-specimen label="filled · 56dp" class="fill">
          <gui-text-field label="Name">
            <input guiTextFieldInput [(ngModel)]="empty3" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · 56dp" class="fill">
          <gui-text-field variant="outlined" label="Name">
            <input guiTextFieldInput [(ngModel)]="empty4" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- M3 specifies a single extra-small (4dp) container corner for both
           variants — there is no shape enumeration to sweep. -->
      <app-demo-block
        heading="Shape"
        hint="A single M3 corner — extra-small (4dp) container for both variants"
        [column]="true"
      >
        <app-demo-specimen label="filled · 4dp top corners" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput [(ngModel)]="empty5" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · 4dp corners" class="fill">
          <gui-text-field variant="outlined" label="Label">
            <input guiTextFieldInput [(ngModel)]="empty6" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- M3 interaction states. Focused / hovered are live (focus or hover the
           specimen); disabled is the resting disabled treatment. -->
      <app-demo-block
        heading="States"
        hint="M3 states — enabled, focused/hovered (interact live) and disabled"
        [column]="true"
      >
        <app-demo-specimen label="enabled (empty)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput [(ngModel)]="empty7" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="enabled (populated)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput #seed [(ngModel)]="enabledValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="focus / hover me" class="fill">
          <gui-text-field label="Focus or hover">
            <input guiTextFieldInput [(ngModel)]="empty8" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="disabled (empty)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput disabled [(ngModel)]="empty9" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="disabled (populated)" class="fill">
          <gui-text-field label="Label">
            <input guiTextFieldInput #seed disabled [(ngModel)]="disabledValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined disabled" class="fill">
          <gui-text-field variant="outlined" label="Label">
            <input
              guiTextFieldInput
              #seed
              disabled
              [(ngModel)]="disabledOutlinedValue"
            />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- M3 error states: error role on label, indicator/outline and supporting
           text (shown via errorText). Empty and populated, both variants. -->
      <app-demo-block
        heading="Error"
        hint="M3 error treatment — error role + error text below the field"
        [column]="true"
      >
        <app-demo-specimen label="filled error (empty)" class="fill">
          <gui-text-field
            label="Email"
            error
            errorText="Enter a valid email"
          >
            <input guiTextFieldInput [(ngModel)]="empty10" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined error (empty)" class="fill">
          <gui-text-field
            variant="outlined"
            label="Email"
            error
            errorText="Enter a valid email"
          >
            <input guiTextFieldInput [(ngModel)]="empty19" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="filled error (populated)" class="fill">
          <gui-text-field
            label="Email"
            error
            errorText="Enter a valid email"
          >
            <input guiTextFieldInput #seed [(ngModel)]="errorValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined error (populated)" class="fill">
          <gui-text-field
            variant="outlined"
            label="Email"
            error
            errorText="Enter a valid email"
          >
            <input guiTextFieldInput #seed [(ngModel)]="errorOutlinedValue" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Required field — asterisk on the label, aria-required on the input. -->
      <app-demo-block
        heading="Required"
        hint="A required field shows an asterisk after the label (M3)"
        [column]="true"
      >
        <app-demo-specimen label="filled · required" class="fill">
          <gui-text-field label="Full name" required>
            <input guiTextFieldInput [(ngModel)]="empty11" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · required" class="fill">
          <gui-text-field variant="outlined" label="Full name" required>
            <input guiTextFieldInput [(ngModel)]="empty12" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Leading icon configuration (both variants). -->
      <app-demo-block
        heading="Leading icon"
        hint="Optional leading (start) icon via [guiTextFieldLeading]"
        [column]="true"
      >
        <app-demo-specimen label="filled" class="fill">
          <gui-text-field label="Search">
            <gui-icon guiTextFieldLeading class="sym">search</gui-icon>
            <input guiTextFieldInput [(ngModel)]="empty13" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined" class="fill">
          <gui-text-field variant="outlined" label="Search">
            <gui-icon guiTextFieldLeading class="sym">search</gui-icon>
            <input guiTextFieldInput [(ngModel)]="empty14" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Trailing icon configuration (both variants). -->
      <app-demo-block
        heading="Trailing icon"
        hint="Optional trailing (end) icon via [guiTextFieldTrailing]"
        [column]="true"
      >
        <app-demo-specimen label="filled" class="fill">
          <gui-text-field label="Password">
            <input guiTextFieldInput [(ngModel)]="empty15" />
            <gui-icon guiTextFieldTrailing class="sym">visibility</gui-icon>
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined" class="fill">
          <gui-text-field variant="outlined" label="Password">
            <input guiTextFieldInput [(ngModel)]="empty16" />
            <gui-icon guiTextFieldTrailing class="sym">visibility</gui-icon>
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Leading AND trailing icons together (M3 configuration). -->
      <app-demo-block
        heading="Leading + trailing icons"
        hint="Both icon slots populated at once (M3 configuration)"
        [column]="true"
      >
        <app-demo-specimen label="filled" class="fill">
          <gui-text-field label="Search">
            <gui-icon guiTextFieldLeading class="sym">search</gui-icon>
            <input guiTextFieldInput #seed [(ngModel)]="bothIconsValue" />
            <gui-icon guiTextFieldTrailing class="sym">close</gui-icon>
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined" class="fill">
          <gui-text-field variant="outlined" label="Search">
            <gui-icon guiTextFieldLeading class="sym">search</gui-icon>
            <input guiTextFieldInput #seed [(ngModel)]="bothIconsOutlinedValue" />
            <gui-icon guiTextFieldTrailing class="sym">close</gui-icon>
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Prefix / suffix configuration (M3). -->
      <app-demo-block
        heading="Prefix & suffix"
        hint="Leading prefix and trailing suffix symbols (M3 configuration)"
        [column]="true"
      >
        <app-demo-specimen label="prefix" class="fill">
          <gui-text-field label="Amount" prefix="$">
            <input guiTextFieldInput #seed [(ngModel)]="prefixValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="suffix" class="fill">
          <gui-text-field variant="outlined" label="Weight" suffix="kg">
            <input guiTextFieldInput #seed [(ngModel)]="suffixValue" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="prefix + suffix" class="fill">
          <gui-text-field label="Username" prefix="@" suffix=".dev">
            <input guiTextFieldInput #seed [(ngModel)]="affixValue" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Supporting text + character counter (M3 measurements row). -->
      <app-demo-block
        heading="Supporting text & counter"
        hint="Optional supporting text and a maxLength character counter (M3)"
        [column]="true"
      >
        <app-demo-specimen label="supporting text" class="fill">
          <gui-text-field
            label="Username"
            supportingText="This will be visible to others"
          >
            <input guiTextFieldInput [(ngModel)]="empty17" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="character counter" class="fill">
          <gui-text-field
            variant="outlined"
            label="Bio"
            supportingText="Keep it short"
            [maxLength]="40"
          >
            <input guiTextFieldInput #seed [(ngModel)]="counterValue" />
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Multi-line (textarea) form (M3 configuration). -->
      <app-demo-block
        heading="Multi-line"
        hint="A textarea projected as the input renders the M3 multi-line field"
        [column]="true"
      >
        <app-demo-specimen label="filled · textarea" class="fill">
          <gui-text-field label="Description">
            <textarea guiTextFieldInput rows="3" [(ngModel)]="empty18">
            </textarea>
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · textarea (populated)" class="fill">
          <gui-text-field variant="outlined" label="Notes">
            <textarea guiTextFieldInput #seed rows="3" [(ngModel)]="multilineValue">
            </textarea>
          </gui-text-field>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive form binding — fully operable, live value readout. -->
      <app-demo-block
        heading="Reactive form"
        hint="The native input keeps its own FormControl (the wrapper is presentational)"
        [column]="true"
      >
        <app-demo-specimen label="type here" class="fill">
          <gui-text-field label="Your name" supportingText="Bound to a FormControl">
            <input guiTextFieldInput [formControl]="name" />
          </gui-text-field>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ name.value || '(empty)' }}</code>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class TextFieldDemo {
  // Empty-specimen models (each its own signal so they stay independent).
  protected readonly empty1 = signal('');
  protected readonly empty2 = signal('');
  protected readonly empty3 = signal('');
  protected readonly empty4 = signal('');
  protected readonly empty5 = signal('');
  protected readonly empty6 = signal('');
  protected readonly empty7 = signal('');
  protected readonly empty8 = signal('');
  protected readonly empty9 = signal('');
  protected readonly empty10 = signal('');
  protected readonly empty11 = signal('');
  protected readonly empty12 = signal('');
  protected readonly empty13 = signal('');
  protected readonly empty14 = signal('');
  protected readonly empty15 = signal('');
  protected readonly empty16 = signal('');
  protected readonly empty17 = signal('');
  protected readonly empty18 = signal('');
  protected readonly empty19 = signal('');

  // Populated-specimen models (fixed seed strings — deterministic, no RNG).
  protected readonly filledValue = signal('Jane Doe');
  protected readonly outlinedValue = signal('Jane Doe');
  protected readonly enabledValue = signal('Jane Doe');
  protected readonly disabledValue = signal('Jane Doe');
  protected readonly disabledOutlinedValue = signal('Jane Doe');
  protected readonly errorValue = signal('not-an-email');
  protected readonly errorOutlinedValue = signal('not-an-email');
  protected readonly bothIconsValue = signal('Material');
  protected readonly bothIconsOutlinedValue = signal('Material');
  protected readonly prefixValue = signal('250.00');
  protected readonly suffixValue = signal('72');
  protected readonly affixValue = signal('jane');
  protected readonly counterValue = signal('Designer & builder');
  protected readonly multilineValue = signal('Some longer text\nacross lines.');

  // Reactive-form specimen.
  protected readonly name = new FormControl('');

  /**
   * Seeded inputs reflect their value into the native element via ngModel, but
   * the input directive only flips its `empty` signal on the native `(input)`
   * event — so after the first render we sync `empty` from the real DOM value.
   * This lifts the floating label into the populated position at rest. Pure
   * post-render sync over committed DOM state: no clock, no RNG.
   */
  private readonly seeded = viewChildren('seed', {
    read: TextFieldInputDirective,
  });

  constructor() {
    afterNextRender(() => {
      for (const input of this.seeded()) {
        input.empty.set(!input.el.value);
      }
    });
  }
}
