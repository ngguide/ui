import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import {
  Customer,
  Order,
  OrderStatus,
  Product,
} from '../core/models';
import { seedCustomers, seedOrders, seedProducts } from './fixtures';

export type OrderStatusFilter = OrderStatus | 'all';
export type OrderSort = 'recent' | 'total-desc' | 'total-asc';
export type ProductCategoryFilter = string | 'all';

/** Inclusive lower/upper bound for the product price-range filter. */
const PRICE_MIN = 0;
const PRICE_MAX = 1000;

/**
 * Commerce (shop) state. Plain Angular signals — the kit's zoneless house style.
 * Seeded synchronously from deterministic fixtures, so a page reload resets every
 * in-session edit (R6.3). `visibleOrders` / `visibleProducts` reactively recompute
 * on any search/filter/sort change (R6.1); CRUD mutations flow to every view that
 * reads the signal (R6.2, R6.6).
 *
 * Provided on the Commerce feature route, so its lifetime is scoped to `/shop`.
 */
@Injectable()
export class ShopStore {
  private readonly productData = signal<Product[]>(seedProducts());
  private readonly orderData = signal<Order[]>(seedOrders());

  readonly customers: Signal<Customer[]> = signal<Customer[]>(seedCustomers());

  // ── Order filters ─────────────────────────────────────────────────────────
  readonly orderQuery: WritableSignal<string> = signal('');
  readonly orderStatusFilter: WritableSignal<OrderStatusFilter> = signal<OrderStatusFilter>('all');
  readonly orderSort: WritableSignal<OrderSort> = signal<OrderSort>('recent');
  /** Inclusive [start, end] placed-date range; null endpoints disable the bound. */
  readonly orderDateStart: WritableSignal<Date | null> = signal<Date | null>(null);
  readonly orderDateEnd: WritableSignal<Date | null> = signal<Date | null>(null);

  // ── Product filters ─────────────────────────────────────────────────────────
  readonly productQuery: WritableSignal<string> = signal('');
  readonly productCategory: WritableSignal<ProductCategoryFilter> = signal<ProductCategoryFilter>('all');
  readonly priceRange: WritableSignal<[number, number]> = signal<[number, number]>([PRICE_MIN, PRICE_MAX]);

  /** Σ qty*unitPrice for an order. */
  totalOf(o: Order): number {
    return o.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  }

  /** Reactive search (number + customer name) + status + date filter + sort (R6.1). */
  readonly visibleOrders: Signal<Order[]> = computed<Order[]>(() => {
    const q = this.orderQuery().trim().toLocaleLowerCase();
    const status = this.orderStatusFilter();
    const start = this.orderDateStart();
    const end = this.orderDateEnd();
    const startMs = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() : null;
    const endMs = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999).getTime() : null;

    const rows = this.orderData()
      .filter((o) => status === 'all' || o.status === status)
      .filter((o) => {
        const t = o.placedAt.getTime();
        if (startMs != null && t < startMs) return false;
        if (endMs != null && t > endMs) return false;
        return true;
      })
      .filter((o) => {
        if (!q) return true;
        const name = this.customerName(o.customerId).toLocaleLowerCase();
        return o.number.toLocaleLowerCase().includes(q) || name.includes(q);
      });

    return rows.sort(this.orderComparator(this.orderSort()));
  });

  private orderComparator(sort: OrderSort): (a: Order, b: Order) => number {
    switch (sort) {
      case 'total-desc':
        return (a, b) => this.totalOf(b) - this.totalOf(a);
      case 'total-asc':
        return (a, b) => this.totalOf(a) - this.totalOf(b);
      case 'recent':
      default:
        return (a, b) => b.placedAt.getTime() - a.placedAt.getTime();
    }
  }

  /** Reactive search (name) + category + price-range filter (R6.1). */
  readonly visibleProducts: Signal<Product[]> = computed<Product[]>(() => {
    const q = this.productQuery().trim().toLocaleLowerCase();
    const category = this.productCategory();
    const [lo, hi] = this.priceRange();
    return this.productData()
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => p.price >= lo && p.price <= hi)
      .filter((p) => !q || p.name.toLocaleLowerCase().includes(q));
  });

  /** Distinct product categories, in first-seen order. */
  readonly categories: Signal<string[]> = computed<string[]>(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of this.productData()) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        out.push(p.category);
      }
    }
    return out;
  });

  readonly ordersEmpty: Signal<boolean> = computed(() => this.visibleOrders().length === 0);
  readonly productsEmpty: Signal<boolean> = computed(() => this.visibleProducts().length === 0);

  // ── Lookups ──────────────────────────────────────────────────────────────
  orderById(id: string): Order | undefined {
    return this.orderData().find((o) => o.id === id);
  }

  productById(id: string): Product | undefined {
    return this.productData().find((p) => p.id === id);
  }

  customerById(id: string): Customer | undefined {
    return this.customers().find((c) => c.id === id);
  }

  customerName(id: string): string {
    return this.customerById(id)?.name ?? 'Unknown customer';
  }

  /** All orders placed by a customer, most-recent first. */
  ordersByCustomer(customerId: string): Order[] {
    return this.orderData()
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
  }

  // ── Product mutations (R6.2, R6.6) ─────────────────────────────────────────
  addProduct(p: Product): void {
    this.productData.update((xs) => [p, ...xs]);
  }

  updateProduct(id: string, patch: Partial<Product>): void {
    this.productData.update((xs) => xs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  removeProduct(id: string): void {
    this.productData.update((xs) => xs.filter((p) => p.id !== id));
  }

  // ── Order mutations ────────────────────────────────────────────────────────
  updateOrderStatus(id: string, status: OrderStatus): void {
    this.orderData.update((xs) => xs.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  // ── Filter setters ─────────────────────────────────────────────────────────
  setOrderQuery(q: string): void {
    this.orderQuery.set(q);
  }

  setOrderStatus(status: OrderStatusFilter): void {
    this.orderStatusFilter.set(status);
  }

  setOrderSort(sort: OrderSort): void {
    this.orderSort.set(sort);
  }

  setOrderDateRange(start: Date | null, end: Date | null): void {
    this.orderDateStart.set(start);
    this.orderDateEnd.set(end);
  }

  setProductQuery(q: string): void {
    this.productQuery.set(q);
  }

  setProductCategory(category: ProductCategoryFilter): void {
    this.productCategory.set(category);
  }

  setPriceRange(range: [number, number]): void {
    this.priceRange.set(range);
  }

  clearOrderFilters(): void {
    this.orderQuery.set('');
    this.orderStatusFilter.set('all');
    this.orderSort.set('recent');
    this.orderDateStart.set(null);
    this.orderDateEnd.set(null);
  }

  clearProductFilters(): void {
    this.productQuery.set('');
    this.productCategory.set('all');
    this.priceRange.set([PRICE_MIN, PRICE_MAX]);
  }
}
