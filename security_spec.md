# Firestore Security Specification

## 1. Data Invariants
1. `store_config/main` contains public branding and theme configuration; readable (`get`) by all visitors and writable (`create`, `update`) via strict schema validation (`isValidStoreConfig`) from PIN-gated Admin Mode without requiring Google Sign-In.
2. `category_overrides/{categoryId}` and `catalog_overrides/{productId}` represent public catalog additions, edits, and deletion markers; readable by all visitors and writable/deletable with `isValidId` and strict schema validation (`isValidCategoryOverride`, `isValidProductOverride`).
3. `orders/{orderId}` stores customer orders; public creation must initialize `status == 'جديد (New)'`, validate `createdAt == request.time`, bound `items.size() <= 100`, and atomically create `order_tracking/{orderId}`. Updates are restricted strictly to `['status', 'updatedAt']` with immutable `createdAt`.
4. `order_tracking/{orderId}` contains zero PII; individual lookup (`get`) is allowed only with a valid `orderId` (no `list` allowed).
5. `customers/{customerId}` and `admins/{uid}` are unused legacy collections and remain locked down (`allow read, write: if false;`).
