# Tri-party collateral-management lifecycle

## Scope

This guide introduces an illustrative tri-party collateral-management path. It keeps custody and collateral controls separate from CCP clearing, bilateral OTC margin, an outright sale, and securities lending.

## Stages

1. Agree eligibility and account-control arrangements.
2. Allocate eligible collateral through the triparty account.
3. Value and substitute only as permitted by the applicable terms.
4. Settle the start and end legs under the repo terms.

## Evidence boundary

DTCC's ACS Triparty announcement supports cleared triparty repo capability for eligible FICC Agent Clearing activity using BNY Global Collateral infrastructure. A separate BNY-Euronext announcement supports triparty collateral selection, valuation, substitution, and eligibility controls in its own service context. Neither source establishes a live position, price, haircut, account balance, geographic coverage, or outcome for a particular transaction.

## Validation

- `npm run data:validate`
- `npm test`
- `CI=1 npm run test:e2e`
- `npm run build`
