/**
 * Fixed "now" for the demo. Every relative date label and seeded date is
 * computed against this constant instead of the wall clock, so server and
 * client renders are byte-identical (no hydration mismatch) and the demo reads
 * the same on any day. June 4, 2026.
 */
export const DEMO_TODAY = new Date(2026, 5, 4);
