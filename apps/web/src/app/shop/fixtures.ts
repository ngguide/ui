import { Customer, Order, OrderStatus, Product } from '../core/models';

/**
 * Deterministic Commerce seed data. Dates are fixed (`new Date(2026, m, d)`),
 * ids are stable strings, and every value is hard-coded — so server and client
 * renders match (no hydration mismatch) and the demo reads the same on any day.
 * A page reload re-runs these factories, resetting all in-session edits (R6.3).
 */

export function seedCustomers(): Customer[] {
  return [
    { id: 'c-01', name: 'Mara Whitfield', email: 'mara@northwind.co' },
    { id: 'c-02', name: 'Theo Castellanos', email: 'theo@brightloop.io' },
    { id: 'c-03', name: 'Priya Nadkarni', email: 'priya@sundeck.com' },
    { id: 'c-04', name: 'Jonas Berg', email: 'jonas@fjordworks.no' },
    { id: 'c-05', name: 'Lucia Romano', email: 'lucia@piazza.it' },
    { id: 'c-06', name: 'Desmond Clarke', email: 'desmond@harbourline.uk' },
    { id: 'c-07', name: 'Amara Okeke', email: 'amara@savannahgoods.ng' },
    { id: 'c-08', name: 'Wei Zhang', email: 'wei@lanternhouse.cn' },
  ];
}

export function seedProducts(): Product[] {
  return [
    p('p-01', 'Aero Wireless Headphones', 'Audio', 199.0, 42, 'active', 250),
    p('p-02', 'Pulse Studio Earbuds', 'Audio', 129.5, 18, 'active', 200),
    p('p-03', 'Resonance Bookshelf Speaker', 'Audio', 349.0, 7, 'draft', 165),
    p('p-04', 'Lumen 4K Monitor 27"', 'Displays', 459.0, 12, 'active', 30),
    p('p-05', 'Lumen Ultrawide 34"', 'Displays', 729.0, 5, 'active', 55),
    p('p-06', 'Glide Portable Display', 'Displays', 219.0, 0, 'draft', 90),
    p('p-07', 'Tactile Mechanical Keyboard', 'Peripherals', 149.0, 34, 'active', 320),
    p('p-08', 'Drift Wireless Mouse', 'Peripherals', 69.0, 60, 'active', 290),
    p('p-09', 'Anchor USB-C Hub', 'Peripherals', 54.5, 25, 'active', 130),
    p('p-10', 'Voyage Laptop Stand', 'Accessories', 39.0, 48, 'active', 110),
    p('p-11', 'Cocoon Travel Sleeve', 'Accessories', 29.0, 3, 'draft', 15),
    p('p-12', 'Beacon Desk Lamp', 'Accessories', 89.0, 21, 'active', 75),
  ];
}

function p(
  id: string,
  name: string,
  category: string,
  price: number,
  stock: number,
  status: Product['status'],
  imageHue: number,
): Product {
  return { id, name, category, price, stock, status, imageHue };
}

export function seedOrders(): Order[] {
  return [
    o('o-01', 'ORD-1001', 'c-01', 'paid', [5, 3], [
      ['p-01', 1, 199.0],
      ['p-08', 2, 69.0],
    ]),
    o('o-02', 'ORD-1002', 'c-03', 'shipped', [5, 2], [
      ['p-04', 1, 459.0],
    ]),
    o('o-03', 'ORD-1003', 'c-02', 'pending', [5, 4], [
      ['p-07', 1, 149.0],
      ['p-09', 1, 54.5],
      ['p-10', 1, 39.0],
    ]),
    o('o-04', 'ORD-1004', 'c-05', 'paid', [5, 1], [
      ['p-02', 2, 129.5],
    ]),
    o('o-05', 'ORD-1005', 'c-04', 'refunded', [4, 28], [
      ['p-05', 1, 729.0],
    ]),
    o('o-06', 'ORD-1006', 'c-06', 'shipped', [4, 26], [
      ['p-01', 1, 199.0],
      ['p-12', 1, 89.0],
    ]),
    o('o-07', 'ORD-1007', 'c-07', 'paid', [4, 22], [
      ['p-08', 3, 69.0],
      ['p-09', 2, 54.5],
      ['p-10', 1, 39.0],
      ['p-11', 1, 29.0],
    ]),
    o('o-08', 'ORD-1008', 'c-08', 'pending', [4, 20], [
      ['p-04', 2, 459.0],
    ]),
    o('o-09', 'ORD-1009', 'c-01', 'paid', [4, 15], [
      ['p-12', 2, 89.0],
    ]),
    o('o-10', 'ORD-1010', 'c-02', 'shipped', [4, 11], [
      ['p-07', 1, 149.0],
      ['p-01', 1, 199.0],
    ]),
    o('o-11', 'ORD-1011', 'c-03', 'paid', [4, 6], [
      ['p-05', 1, 729.0],
      ['p-10', 2, 39.0],
    ]),
    o('o-12', 'ORD-1012', 'c-05', 'refunded', [3, 30], [
      ['p-02', 1, 129.5],
    ]),
    o('o-13', 'ORD-1013', 'c-06', 'pending', [3, 24], [
      ['p-09', 4, 54.5],
    ]),
    o('o-14', 'ORD-1014', 'c-04', 'shipped', [3, 18], [
      ['p-12', 1, 89.0],
      ['p-08', 1, 69.0],
      ['p-10', 1, 39.0],
    ]),
  ];
}

function o(
  id: string,
  number: string,
  customerId: string,
  status: OrderStatus,
  placed: [number, number],
  lines: [string, number, number][],
): Order {
  return {
    id,
    number,
    customerId,
    status,
    placedAt: new Date(2026, placed[0], placed[1]),
    lines: lines.map(([productId, qty, unitPrice]) => ({ productId, qty, unitPrice })),
  };
}
