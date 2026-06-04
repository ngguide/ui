import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import { GuiDivider } from '@ngguide/ui/divider';
import {
  TextFieldComponent,
  TextFieldInputDirective,
} from '@ngguide/ui/text-field';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import { RadioGroupComponent, RadioComponent } from '@ngguide/ui/radio';
import { GuiSnackbar } from '@ngguide/ui/snackbar';

import { Product, ProductStatus } from '../core/models';
import { ShopStore } from './shop.store';

type ProductFormGroup = FormGroup<{
  name: FormControl<string>;
  category: FormControl<string>;
  price: FormControl<string>;
  stock: FormControl<string>;
  status: FormControl<string>;
}>;

/** A positive-number string validator (parses to a finite number > 0). */
function positiveNumber(control: AbstractControl): ValidationErrors | null {
  const n = Number(control.value);
  return Number.isFinite(n) && n > 0 ? null : { positive: true };
}

/** A non-negative-integer-ish string validator (finite number ≥ 0). */
function nonNegativeNumber(control: AbstractControl): ValidationErrors | null {
  const n = Number(control.value);
  return Number.isFinite(n) && n >= 0 ? null : { nonNegative: true };
}

/**
 * Create / edit product form (`/shop/products/new` and `/shop/products/:id`).
 * Reactive `FormGroup` with inline validation; on submit it adds or updates the
 * product in the shared {@link ShopStore}, toasts, and returns to the list.
 * Renders a "not found" state when editing an id that does not resolve.
 */
@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    IconComponent,
    GuiCard,
    GuiDivider,
    TextFieldComponent,
    TextFieldInputDirective,
    ChipComponent,
    ChipSetComponent,
    RadioGroupComponent,
    RadioComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent {
  protected readonly store = inject(ShopStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(GuiSnackbar);

  private readonly editId = this.route.snapshot.paramMap.get('id');
  private readonly existing = this.editId
    ? this.store.productById(this.editId)
    : undefined;

  protected readonly isEdit = !!this.editId;
  /** True only when editing an id that does not resolve to a product. */
  protected readonly notFound = !!this.editId && !this.existing;

  /** Distinct categories from the store, offered as quick-pick chips. */
  protected readonly categories = computed(() => this.store.categories());

  /** Local mirror two-way-bound to the category quick-pick chip set. */
  protected readonly categoryPick = signal<string | null>(this.existing?.category ?? null);

  protected readonly form: ProductFormGroup = new FormGroup({
    name: new FormControl(this.existing?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    category: new FormControl(this.existing?.category ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    price: new FormControl(this.existing ? String(this.existing.price) : '', {
      nonNullable: true,
      validators: [Validators.required, positiveNumber],
    }),
    stock: new FormControl(this.existing ? String(this.existing.stock) : '0', {
      nonNullable: true,
      validators: [Validators.required, nonNegativeNumber],
    }),
    status: new FormControl<string>(this.existing?.status ?? 'active', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    // A chosen quick-pick chip fills the (free-text) category field reactively.
    effect(() => {
      const picked = this.categoryPick();
      if (picked) {
        this.form.controls.category.setValue(picked);
        this.form.controls.category.markAsTouched();
      }
    });
  }

  /** True when a control should surface its error chrome (invalid + touched). */
  protected showError(control: 'name' | 'category' | 'price' | 'stock'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  protected nameError(): string {
    const c = this.form.controls.name;
    if (c.hasError('required')) return 'Name is required.';
    if (c.hasError('minlength')) return 'Use at least 2 characters.';
    return '';
  }

  protected categoryError(): string {
    return this.form.controls.category.hasError('required')
      ? 'Category is required.'
      : '';
  }

  protected priceError(): string {
    const c = this.form.controls.price;
    if (c.hasError('required')) return 'Price is required.';
    if (c.hasError('positive')) return 'Enter a price above 0.';
    return '';
  }

  protected stockError(): string {
    const c = this.form.controls.stock;
    if (c.hasError('required')) return 'Stock is required.';
    if (c.hasError('nonNegative')) return 'Stock cannot be negative.';
    return '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const status = (v.status === 'draft' ? 'draft' : 'active') as ProductStatus;
    const price = Number(v.price);
    const stock = Number(v.stock);

    if (this.existing) {
      this.store.updateProduct(this.existing.id, {
        name: v.name.trim(),
        category: v.category.trim(),
        price,
        stock,
        status,
      });
    } else {
      this.store.addProduct(this.buildProduct(v.name, v.category, price, stock, status));
    }

    this.snackbar.open({ message: 'Product saved', showClose: true, duration: 4000 });
    this.router.navigate(['/shop/products']);
  }

  /** Deterministic id + imageHue from a name slug + the catalog size (no randomness). */
  private buildProduct(
    name: string,
    category: string,
    price: number,
    stock: number,
    status: ProductStatus,
  ): Product {
    const slug =
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'product';
    return {
      id: `p-${slug}-${this.store.visibleProducts().length + 1}`,
      name: name.trim(),
      category: category.trim(),
      price,
      stock,
      status,
      imageHue: this.hueFromName(name),
    };
  }

  /** Stable hue (0..359) derived from the name string — deterministic. */
  private hueFromName(name: string): number {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }
}
