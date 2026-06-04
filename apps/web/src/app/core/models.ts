/**
 * Shared domain models for the three showcase applications (Console / Tracker /
 * Commerce). These are demo-host concerns only — the published `@ngguide/ui`
 * library never sees them. All data is in-memory mock data seeded deterministically.
 */

// ── Console (admin) ─────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';
export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: Date;
  lastActiveAt: Date;
  /** Hue (0..360) used to render a deterministic CSS-gradient avatar — no network. */
  avatarHue: number;
}

export interface Metric {
  key: string;
  label: string;
  value: number;
  /** Target for this period; goal attainment = `value / goal` (clamped 0..1). */
  goal: number;
  /** Period-over-period change as a percentage (e.g. 12.5 → +12.5%). */
  deltaPct: number;
  format: 'number' | 'currency' | 'percent';
  /** Fixed trend samples for the inline sparkline. */
  spark: number[];
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  at: Date;
}

// ── Tracker (tasks) ─────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Member {
  id: string;
  name: string;
  avatarHue: number;
}

export interface Label {
  id: string;
  name: string;
  hue: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  labelIds: string[];
  dueAt: Date | null;
  dueTime: GuiTime | null;
}

// ── Commerce (shop) ─────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'draft';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'refunded';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  /** Hue (0..360) → deterministic CSS-gradient product imagery (no network). */
  imageHue: number;
}

export interface OrderLine {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  status: OrderStatus;
  placedAt: Date;
  lines: OrderLine[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

// Re-export the datetime contract used by Task so feature code imports models
// from one place. The published types live in @ngguide/ui/datetime.
import type { GuiTime } from '@ngguide/ui/datetime';
export type { GuiTime, GuiDateRange } from '@ngguide/ui/datetime';
