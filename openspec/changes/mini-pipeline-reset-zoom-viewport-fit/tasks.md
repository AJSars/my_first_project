## 1. Viewport math

- [x] 1.1 Implement a **pure** bounding-box + margin calculation from `posProcess` / `posFile` and shape constants, **including** rendered **link segments** in the bounds (or equivalent) so lines are **not** clipped after reset
- [x] 1.2 **Reset zoom** applies only `graphView` / `userAdjusted`; **no** mutations to graph model or **element positions**

## 2. Edge cases

- [x] 2.1 **Empty** diagram (no Processes and no Files): **Reset zoom** sets **default** viewport (document in README)
- [x] 2.2 Single entity / tiny extent: ensure **minimum** viewBox dimensions remain readable (clamp)

## 3. UX consistency

- [x] 3.1 After reset, **Processes**, **Files**, and **all link lines** lie fully inside the canvas; **margin** visible; **positions** unchanged (explicit acceptance / tests)
- [x] 3.2 Update **README** (feature line for Reset zoom) if behavior is user-visible

## 4. Tests

- [x] 4.1 Unit test(s) for bbox + margin → expected viewBox on a small fixture; assert bounds **contain** segment endpoints (or full line extents) for at least one link
- [x] 4.2 Unit test: empty graph default view
- [x] 4.3 Assert **positions** unchanged: same `posProcess` / `posFile` before and after fit helper (or integration smoke)
