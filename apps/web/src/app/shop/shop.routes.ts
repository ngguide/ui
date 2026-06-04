import { Routes } from '@angular/router';
import { ShopStore } from './shop.store';

/**
 * Commerce feature routes. `ShopStore` is provided here, so it is created once
 * for the whole `/shop` branch and shared by every screen (orders, products,
 * customers) — and disposed when the user leaves Commerce.
 */
export const shopRoutes: Routes = [
  {
    path: '',
    providers: [ShopStore],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'orders' },
      {
        path: 'orders',
        title: 'Orders · Commerce',
        loadComponent: () =>
          import('./orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'orders/:id',
        title: 'Order · Commerce',
        loadComponent: () =>
          import('./order-detail.component').then((m) => m.OrderDetailComponent),
      },
      {
        path: 'products',
        title: 'Products · Commerce',
        loadComponent: () =>
          import('./products.component').then((m) => m.ProductsComponent),
      },
      {
        path: 'products/new',
        title: 'New product · Commerce',
        loadComponent: () =>
          import('./product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id',
        title: 'Edit product · Commerce',
        loadComponent: () =>
          import('./product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'customers',
        title: 'Customers · Commerce',
        loadComponent: () =>
          import('./customers.component').then((m) => m.CustomersComponent),
      },
      {
        path: 'customers/:id',
        title: 'Customer · Commerce',
        loadComponent: () =>
          import('./customer-detail.component').then((m) => m.CustomerDetailComponent),
      },
    ],
  },
];
