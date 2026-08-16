# Post-issuance bond servicing

## Scope

This route follows servicing after a bond has been issued. It is deliberately separate from the primary-market underwriting, allocation, and DvP route.

## Stages

1. Announce the payment or redemption terms and date.
2. Establish the record-date entitlement.
3. Fund the paying-agent side of the event.
4. Allocate the payment and update an eligible depository position.

## Evidence boundary

The DTC Redemptions Service Guide supports the redemption-service example, including notices, entitlements, collection, allocation, and position reduction. This product guide does not calculate coupon amounts, tax, live payment status, issuer-specific terms, or investor-level holdings.

## Validation

- `npm run data:validate`
- `npm test`
