# Market lifecycle expansion: 30 delivery rounds

## Audit outcome

The existing bond-issuance and OTC-derivatives guides already cover primary
allocation, delivery versus payment, confirmation, collateral, clearing, margin,
novation, default management, and maturity. This campaign deliberately avoids
duplicating those guides. It adds five adjacent institutional market lifecycles
where the current network picker has no explanatory route.

The proposed routes are supported by primary-source materials: CLSSettlement
for FX payment-versus-payment (PvP), DTCC/FICC for U.S. government-securities
repo clearing and netting, the SEC ETF investor bulletin for creation and
redemption, DTCC materials for securities financing, and the Loan Syndications
and Trading Association for syndicated-loan market practice. They remain
schematic: no prices, legal terms, participant identities, or live positions are
represented.

## Thirty independently mergeable rounds

1. Publish this scope and non-duplication audit.
2. Add an FX PvP network and primary source record.
3. Describe FX trade capture, payment instruction, PvP, and funding return.
4. Explain PvP versus trade execution and unilateral payment.
5. Add FX route accessibility regression coverage.
6. Document FX source scope and date treatment.
7. Add a repo-financing network and primary source record.
8. Describe repo agreement, collateral eligibility, netting, and return leg.
9. Explain repo financing versus an outright securities sale.
10. Explain collateral allocation versus trade-by-trade DvP.
11. Add repo route accessibility regression coverage.
12. Document repo source scope and date treatment.
13. Add an ETF primary-market network and SEC source record.
14. Describe creation basket, creation units, secondary trading, and redemption.
15. Explain authorised participants versus retail secondary-market investors.
16. Explain NAV, basket delivery, and exchange price boundaries.
17. Add ETF route accessibility regression coverage.
18. Document ETF source scope and date treatment.
19. Add a securities-financing network and DTCC source record.
20. Describe borrow request, collateral, mark-to-market, and return.
21. Explain securities lending versus outright sale and settlement.
22. Explain collateral valuation versus lending-fee economics.
23. Add securities-financing route accessibility regression coverage.
24. Document securities-financing source scope and date treatment.
25. Add a syndicated-loan network and market-practice source record.
26. Describe mandate, syndication, closing, and servicing roles.
27. Explain arranger coordination versus lender funding and agency servicing.
28. Explain primary syndication versus secondary loan trading.
29. Add cross-network keyboard and localized-route regression coverage.
30. Run the final source, data, unit, desktop/mobile E2E, build, CI, and main audit.

## Delivery rule

Every round is a main-target PR with one focused change, local validation,
successful remote `Quality` verification, and a confirmed merge before the next
round begins. The final audit must verify all 30 merged PRs against `origin/main`.
