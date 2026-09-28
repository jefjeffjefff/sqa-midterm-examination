# Blackbox Test Case Template

## Equivalence Partitioning Table

| TC ID | Requirement ID | Input Field | Valid Partition | Invalid Partition | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-EP-01 | R15 | Email | proper address | malformed | user+lab@school.edu | Accepted |  |  |

## Boundary Value Analysis Table

| TC ID | Requirement ID | Field | Min-1 | Min | Min+1 | Max-1 | Max | Max+1 | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-BVA-01 | R1 | Quantity | 0 | 1 | 2 | 9 | 10 | 11 | only 1..10 accepted |  |  |

## Decision Table (Discount Rules)

| TC ID | Student | Member | Promo Eligible | Expected Discount Source | Expected Discount |
|---|---|---|---|---|---|
| TC-DT-01 | N | N | N | none | 0 |
| TC-DT-02 | Y | N | N | student | 10% |
| TC-DT-03 | N | Y | N | member | 15% |
| TC-DT-04 | Y | Y | Y | largest only | max of the three |

## State Transition Table (Orders)

| TC ID | Start State | Event | Expected Next State | Actual Next State | Status |
|---|---|---|---|---|---|
| TC-ST-01 | Cancelled | Mark Paid | Not allowed |  |  |
| TC-ST-02 | Pending | Cancel | Cancelled |  |  |
