# Data gaps and usability review — 2026-09-22

Scope: checked-in data, active dashboard, learning pages, source registry, issuance explorer and briefing library. This is a code/data audit plus automated browser validation, not customer research or a fresh verification of every publisher's figures.

## Inventory

All 19 networks have at least one snapshot entry, a linked registry source and a process guide. The source validator passes for 25 entries and 23 sources (snapshot 2026.09.05). No metric field is an empty string. A populated entry does **not** establish complete market data: many entries describe a service, rule or process rather than a measured market quantity.

| Networks | Existing information | Remaining data limitation |
| --- | --- | --- |
| SWIFT, Visa, CHIPS/Fedwire, FX PvP, USDC | Volume, value, message count or supported-network count | Different dates, regions and units; no common time series or real-time feed |
| Bond issuance, listed derivatives, ETF primary market | Settlement timing, reset/mark-to-market cycle, creation-unit concept | Rules and concepts are not market activity measurements |
| Securities issuance | Treasury auction stage count and separate issuance paths | A Treasury example is not coverage of all securities |
| Multi-bond issuance, bond servicing, ABS, leveraged derivatives, credit derivatives, repo, triparty collateral, securities lending, syndicated loans | Framework, service or practice reference | No volume/value series included; do not represent these labels as measured quantities |
| OTC derivatives | Publication cadence | Cadence is not outstanding notional or market value; English display currently contains Korean `반기` |

## Partial-data problems addressed

- Missing source records were still presented as verified and the sidebar always claimed a primary source was linked. Now the selected view warns about orphaned metric records and the sidebar reports pending, absent or actual source counts.
- The registry lacked a network-level completeness view. It now lists all 19 networks, metric/source counts, missing source references, per-network navigation and retry for incomplete responses.
- Missing metric coverage/unit fields appeared as unexplained dashes. Explicit unavailable labels now explain these states without inventing a zero or date.
- Existing preceding fixes retain structural sources when metrics are empty, distinguish loading/error/empty library states, and connect learning → evidence → briefing.

Missing-source scenarios are injected browser responses. They are not claims that the committed registry or production service is currently empty. Retry reloads the current snapshot; it does not collect new provider data.

## Prioritized next improvements

| Priority | Change | Why / acceptance criteria |
| --- | --- | --- |
| P1 | Give every snapshot entry an explicit kind: statistic, rule, service or process | Show the kind on cards and exports; never aggregate or compare service placeholders as quantities. Review the dataset and validator together. |
| P1 | Normalize numeric scales and separate localized display strings | Existing SWIFT numeric values and million-formatted display require unit/scale review before any calculations. English must not show `반기`. Verify each conversion against its primary source; do not silently rewrite values. |
| P1 | Source and coverage search/filter | Filter by provider, network and missing status, show result counts, reset without losing selection, preserve keyboard focus and mobile reflow. |
| P1 | Show freshness at the point of use | Distinguish publication date, retrieval date, snapshot generation and review due date. Overdue review must not imply the provider's fact is invalid or that a refresh already ran. |
| P2 | Reduce long reading paths | Validate a compact summary/detail layout for coverage and source records; keep primary action and selected context visible on narrow screens. |
| P2 | Validate first-use tasks with five users | Observe finding a network, checking a source, exporting a brief, and recovering from unavailable data. Record completion and confusion, not only clicks. No analytics installed here. |
| P2 | Expand actual market measurements selectively | Choose a customer question, licensed/official source, geographic scope, period, unit and refresh owner before adding a series. Prioritize a coherent comparison over filling every card with unrelated numbers. |

## Validation

76 unit/Worker tests; 119 browser tests passed and one existing intentional skip. New cases test every network's source linkage, empty metrics, missing registry records, bilingual recovery, mobile layout and navigation. Build, data validator and Worker typecheck pass. Live payment/provider activation and production deployment remain separate.
