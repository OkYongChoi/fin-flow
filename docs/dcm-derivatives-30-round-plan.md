# Bond issuance and OTC derivatives: 30 delivery rounds

This plan expands the current source-backed schematic without presenting live trades, legal advice, or executable market terms. Each numbered item is an independently reviewed and merged PR.

1. Typed issuance and derivatives guide model
2. Bond-specific learning timeline
3. Derivatives-specific learning timeline
4. Primary issuance versus secondary settlement boundary
5. Issuer role explanation
6. Lead manager and underwriting role explanation
7. Depository and DvP role explanation
8. Allocation versus trading distinction
9. OTC counterparties role explanation
10. Trade confirmation distinction
11. Valuation versus payment distinction
12. Bilateral collateral distinction
13. Central clearing distinction
14. Initial margin explanation
15. Variation margin explanation
16. Margin-call timing caveat
17. Novation explanation
18. Default-management boundary
19. Product maturity and settlement distinction
20. Notional versus exposure distinction
21. Collateral versus settlement-asset distinction
22. Route semantic labels for screen-reader table
23. Localized issuance map-table labels
24. Localized derivatives map-table labels
25. Source-link scope labels
26. Source-date disclosure for guided stages
27. Network-card primary-market summary
28. Network-card OTC lifecycle summary
29. End-to-end accessibility coverage
30. Final cross-network regression and documentation audit

## Final audit scope

- Keep bond issuance in the primary-market allocation and delivery-versus-payment context; do not represent it as secondary-market trading.
- Keep OTC derivatives distinctions explicit: confirmation, valuation, collateral, clearing, margin, novation, default management, maturity, notional, and settlement are separate concepts.
- Treat map paths and source links as explanatory, source-backed schematics rather than live trade records or legal/execution guidance.
- Run data validation, unit tests, full Playwright coverage, production build, and whitespace checks before the final merge.
