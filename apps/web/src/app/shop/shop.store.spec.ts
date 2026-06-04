import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShopStore } from './shop.store';
import { Order, Product } from '../core/models';

function makeStore(): ShopStore {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ShopStore],
  });
  return TestBed.inject(ShopStore);
}

const NEW_PRODUCT: Product = {
  id: 'p-new',
  name: 'Quartz Webcam',
  category: 'Peripherals',
  price: 99.0,
  stock: 10,
  status: 'active',
  imageHue: 140,
};

describe('ShopStore', () => {
  it('filters orders by status (R6.1)', () => {
    const s = makeStore();
    s.setOrderStatus('paid');
    expect(s.visibleOrders().length).toBeGreaterThan(0);
    expect(s.visibleOrders().every((o) => o.status === 'paid')).toBe(true);

    s.setOrderStatus('all');
    expect(s.visibleOrders().length).toBeGreaterThan(s.visibleOrders().filter((o) => o.status === 'paid').length);
  });

  it('sorts orders by total ascending and descending', () => {
    const s = makeStore();

    s.setOrderSort('total-desc');
    const desc = s.visibleOrders().map((o) => s.totalOf(o));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));

    s.setOrderSort('total-asc');
    const asc = s.visibleOrders().map((o) => s.totalOf(o));
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
  });

  it('totalOf computes Σ qty*unitPrice', () => {
    const s = makeStore();
    const o: Order = {
      id: 'o-x',
      number: 'ORD-9999',
      customerId: 'c-01',
      status: 'paid',
      placedAt: new Date(2026, 5, 4),
      lines: [
        { productId: 'p-01', qty: 2, unitPrice: 199 },
        { productId: 'p-08', qty: 3, unitPrice: 69 },
      ],
    };
    expect(s.totalOf(o)).toBe(2 * 199 + 3 * 69);
  });

  it('add / update / remove reflect in visibleProducts (R6.2)', () => {
    const s = makeStore();
    const before = s.visibleProducts().length;

    s.addProduct(NEW_PRODUCT);
    expect(s.visibleProducts().length).toBe(before + 1);
    expect(s.productById('p-new')?.name).toBe('Quartz Webcam');

    s.updateProduct('p-new', { name: 'Quartz Pro Webcam' });
    expect(s.productById('p-new')?.name).toBe('Quartz Pro Webcam');

    s.removeProduct('p-new');
    expect(s.productById('p-new')).toBeUndefined();
    expect(s.visibleProducts().length).toBe(before);
  });

  it('filters products by price range (R6.1)', () => {
    const s = makeStore();
    s.setPriceRange([0, 100]);
    expect(s.visibleProducts().length).toBeGreaterThan(0);
    expect(s.visibleProducts().every((p) => p.price >= 0 && p.price <= 100)).toBe(true);
    expect(s.visibleProducts().some((p) => p.price > 100)).toBe(false);
  });

  it('exposes distinct categories', () => {
    const s = makeStore();
    const cats = s.categories();
    expect(cats.length).toBe(new Set(cats).size);
    expect(cats.length).toBeGreaterThan(1);
  });

  it('ordersEmpty / productsEmpty reflect filters (R9.x)', () => {
    const s = makeStore();
    expect(s.ordersEmpty()).toBe(false);
    s.setOrderQuery('zzz-no-such-order');
    expect(s.ordersEmpty()).toBe(true);
    s.clearOrderFilters();
    expect(s.ordersEmpty()).toBe(false);

    expect(s.productsEmpty()).toBe(false);
    s.setProductQuery('zzz-no-such-product');
    expect(s.productsEmpty()).toBe(true);
    s.clearProductFilters();
    expect(s.productsEmpty()).toBe(false);
  });
});
