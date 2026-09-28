# CampusCart Midterm Requirements (System Oracle)

Use this as the expected behavior for blackbox test cases.

## Functional Rules

1. Quantity per cart line must be an integer from 1 to 10.
2. Out-of-stock products (stock = 0) must not be addable to cart.
3. Search should be case-insensitive and trim leading/trailing spaces.
4. Sorting by price must be numeric ascending.
5. Pagination for 25 products and page size 10 must produce 3 pages.
6. Coupon codes are case-insensitive.
7. SAVE10 gives 10% off if subtotal is at least 500.
8. FLAT50 gives 50 off if subtotal is at least 200.
9. Only one discount source applies: Student (10%), Member (15%), or Promo. Use whichever gives the largest discount.
10. Free shipping applies when discounted subtotal is greater than or equal to 1000.
11. Tax is 8% of discounted subtotal, rounded once at the final tax value.
12. Checkout must fail if cart is empty.
13. Age must be from 13 to 120, and 17 is valid.
14. Display name length must be from 1 to 20 after trimming.
15. Email should support valid plus-tag format like user+lab@school.edu.
16. Card number must pass Luhn check for all supported lengths.
17. Remove button must remove the selected product line, not a different line.
18. Valid order transitions: Draft -> Pending -> Paid -> Refunded, and Draft/Pending -> Cancelled.
19. Cancelled orders must never transition to Paid.
20. Refund must be allowed only for Paid orders.
21. Payment failures must show an error and must not show success.
22. Pay button must prevent duplicate order creation while processing.
23. Logout/reset-like data clear action must remove all app keys prefixed with campuscart-.
24. Local state must persist after refresh and remain isolated per browser profile/device.

## Non-Functional Notes

1. State persistence must use browser localStorage.
2. Device ID should remain stable per browser profile unless local storage is cleared.
3. App should remain usable on mobile width 375px.
