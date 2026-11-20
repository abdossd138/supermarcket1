/**
 * Security Rules Specification & Verification Matrix for Al-Market Al-Masry.
 * Validates schema enforcement and invariants against firestore.rules.
 */
export interface RuleTestCase {
  name: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

export const SCHEMA_GUARD_TESTS: RuleTestCase[] = [
  {
    name: '1. Invalid doc ID defacement of store_config/other',
    collection: 'store_config/other',
    operation: 'update',
    auth: null,
    payload: { storeName: 'Hacked Store' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Shadow/Ghost field injection in store_config/main',
    collection: 'store_config/main',
    operation: 'create',
    auth: null,
    payload: { storeName: 'Test', isVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Order status shortcutting during create',
    collection: 'orders/ORD-1001',
    operation: 'create',
    auth: null,
    payload: { id: 'ORD-1001', status: 'تم التوصيل بنجاح (Delivered)' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Backdated createdAt timestamp injection on order',
    collection: 'orders/ORD-1002',
    operation: 'create',
    auth: null,
    payload: { id: 'ORD-1002', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Orphan order create without atomic order_tracking document',
    collection: 'orders/ORD-1003',
    operation: 'create',
    auth: null,
    payload: { id: 'ORD-1003', status: 'جديد (New)' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Unbounded items array > 100 in order',
    collection: 'orders/ORD-1004',
    operation: 'create',
    auth: null,
    payload: { id: 'ORD-1004', items: new Array(101).fill({}) },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Order tracking enumeration via list query',
    collection: 'order_tracking',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Negative price product override rejected',
    collection: 'catalog_overrides/p_1',
    operation: 'create',
    auth: null,
    payload: { id: 'p_1', price: -10 },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Access to locked admins collection denied',
    collection: 'admins/attacker',
    operation: 'create',
    auth: null,
    payload: { uid: 'attacker', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Oversized document ID poisoning (> 128 chars)',
    collection: `catalog_overrides/${'a'.repeat(200)}`,
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
