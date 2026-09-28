# Whitebox Testing Guide

## Suggested Target Functions

1. src/lib/pricing.ts -> calculatePrice
2. src/lib/validators.ts -> validateAge, validateEmail, validateCardNumber, validateQty
3. src/lib/orderMachine.ts -> canTransition, canRefund
4. src/store/useAppStore.ts -> addItem, updateQty, removeItem

## Whitebox Tasks

1. Draw a control flow graph for calculatePrice.
2. Compute cyclomatic complexity for calculatePrice and validateCardNumber.
3. Produce branch coverage test cases for coupon and shipping logic.
4. Produce condition coverage for order transition validation.
5. Locate at least one unreachable or defective branch.

## Branch Coverage Checklist

| Function | Branch Condition | Covered by TC IDs |
|---|---|---|
| calculatePrice | promo exists / not exists |  |
| calculatePrice | subtotal threshold pass / fail |  |
| calculatePrice | shipping free / not free |  |
| validateAge | under range / boundary / over range |  |
| canTransition | allowed / blocked transition |  |

## Defect Localization Sheet

| Bug ID | File | Function | Line (approx) | Root Cause Summary |
|---|---|---|---|---|
| WB-01 | src/lib/pricing.ts | calculatePrice |  |  |
