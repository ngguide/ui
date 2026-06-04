import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkMenu } from '@angular/cdk/menu';

import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiCard } from '@ngguide/ui/card';
import {
  TextFieldComponent,
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { ChipComponent, ChipSetComponent } from '@ngguide/ui/chip';
import {
  SegmentedButtonComponent,
  SegmentedButtonGroupComponent,
} from '@ngguide/ui/segmented-button';
import { SliderComponent } from '@ngguide/ui/slider';
import { GuiCarousel, GuiCarouselItem } from '@ngguide/ui/carousel';
import { GuiCarouselLayout } from '@ngguide/ui/carousel';
import { SplitButtonComponent } from '@ngguide/ui/split-button';
import { MenuDirective, MenuItemComponent } from '@ngguide/ui/menu';
import { GuiSnackbar } from '@ngguide/ui/snackbar';

import { Product, ProductStatus } from '../core/models';
import { formatCurrency, formatNumber } from '../core/formatters';
import { ProductCategoryFilter, ShopStore } from './shop.store';

type ProductView = 'grid' | 'list';

const CAROUSEL_LAYOUTS: readonly GuiCarouselLayout[] = [
  'multi-browse',
  'uncontained',
  'hero',
  'full-screen',
];

/**
 * Commerce products screen (`/shop/products`). A featured carousel over the
 * first products (with a layout switcher), a search/category/price toolbar that
 * feeds the shared {@link ShopStore}, a grid/list toggle, and the product grid
 * rendering `store.visibleProducts()` with deterministic gradient imagery.
 */
@Component({
  selector: 'app-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CdkMenu,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    GuiCard,
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldLeadingDirective,
    TextFieldTrailingDirective,
    ChipComponent,
    ChipSetComponent,
    SegmentedButtonComponent,
    SegmentedButtonGroupComponent,
    SliderComponent,
    GuiCarousel,
    GuiCarouselItem,
    SplitButtonComponent,
    MenuDirective,
    MenuItemComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  protected readonly store = inject(ShopStore);
  private readonly snackbar = inject(GuiSnackbar);

  protected readonly search = new FormControl('', { nonNullable: true });

  /** Local mirror of the store's category filter, two-way bound to the chip set. */
  protected readonly category = signal<ProductCategoryFilter>('all');
  /** Local mirror of the store's price-range filter, two-way bound to the slider. */
  protected readonly price = signal<[number, number]>([0, 1000]);
  /** Grid vs list presentation of the product collection. */
  protected readonly view = signal<ProductView>('grid');
  /** Current carousel layout, cycled via the layout switcher. */
  protected readonly layout = signal<GuiCarouselLayout>('multi-browse');

  /** First handful of products, shown in the featured carousel strip. */
  protected readonly featured = computed(() => this.store.visibleProducts().slice(0, 6));

  protected readonly priceMin = 0;
  protected readonly priceMax = 1000;

  protected formatCurrency = formatCurrency;
  protected formatNumber = formatNumber;

  constructor() {
    // Two-way-bound signals push their changes into the store reactively (R6.1).
    effect(() => this.store.setProductCategory(this.category() ?? 'all'));
    effect(() => this.store.setPriceRange(this.price()));

    this.search.valueChanges.subscribe((v) => this.store.setProductQuery(v ?? ''));
  }

  protected gradient(p: Product): string {
    return `linear-gradient(135deg, oklch(75% 0.12 ${p.imageHue}deg), oklch(55% 0.16 ${p.imageHue + 40}deg))`;
  }

  protected cycleLayout(): void {
    const i = CAROUSEL_LAYOUTS.indexOf(this.layout());
    this.layout.set(CAROUSEL_LAYOUTS[(i + 1) % CAROUSEL_LAYOUTS.length]);
  }

  protected setLayout(layout: GuiCarouselLayout): void {
    this.layout.set(layout);
  }

  protected publish(): void {
    this.snackbar.open({ message: 'Catalog published', showClose: true, duration: 4000 });
  }

  protected saveDraft(): void {
    this.snackbar.open({ message: 'Saved as draft', showClose: true, duration: 4000 });
  }

  protected clearSearch(): void {
    this.search.setValue('');
  }

  protected clearFilters(): void {
    this.search.setValue('');
    this.category.set('all');
    this.price.set([this.priceMin, this.priceMax]);
    this.store.clearProductFilters();
  }

  protected statusLabel(status: ProductStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  protected stockLabel(stock: number): string {
    if (stock === 0) return 'Out of stock';
    return `${formatNumber(stock)} in stock`;
  }

  protected trackById(_: number, p: Product): string {
    return p.id;
  }
}
