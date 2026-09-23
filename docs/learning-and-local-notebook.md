# Learning, discovery and the browser notebook

## Gaps addressed

The existing product already offered nineteen network guides, everyday-question templates, source comparisons, Markdown/PDF, editable file backups and a searchable account library. Three gaps remained for people exploring finance without an account: no term lookup, formal-name-only discovery, and only one recoverable working draft.

### Everyday-language network search

The sidebar searches a lightweight bilingual index of existing names/descriptions plus curated everyday phrases. Korean/English queries, spaces, hyphens and full-width characters are normalized. Examples include overseas transfers, card payments, digital dollars, stock borrowing and ETFs. Results point to related catalog flows; their original scope and source boundaries still apply. A match for a bank transfer does not turn the US-dollar guide into a universal model of retail bank transfers.

Filtering preserves the selected network and URL until the visitor explicitly chooses a result. The existing out-of-results notice, clear action, keyboard navigation and no-results state remain available. Search is local and does not call a model or external search service.

### Financial glossary

The learning page adds a searchable bilingual glossary with plain-language definitions, distinctions, related flows and official sources. Existing learning routes remain available. Each term has a direct link, and interface-language changes preserve its URL. The glossary loads only with the learning page; its content is not added to initial explorer/workspace downloads.

Glossary source review dates record review of explanatory pages, not market data. No catalog values, source retrieval dates or snapshot version were changed. Terms focus on infrastructure roles rather than product recommendations.

### Browser notebook

Guests can explicitly keep multiple immutable copies of a working draft. A copy contains only a generated local ID, save time, title, notes, network IDs and document language. Incomplete drafts are valid. Opening a copy creates a working draft through the existing replacement confirmation and undo flow. Editing does not overwrite the original copy; saving identical content does not add a duplicate. Previewing a reopened copy uses the current sources; it is not an archive of source documents.

Search covers titles and notes, with recent/title ordering, individual editable-file backups and confirmed deletion. Deleting a copy does not modify the current editor. Copies are stored only in this browser, can be read by others using the same browser, and disappear when browser data is cleared. File backup remains the portable recovery path.

The notebook mounts only for a ready guest session. Signed-in working drafts retain their per-user session storage and existing server-owned cloud rules. No account document is automatically placed into the guest notebook. Sign-in still transfers only the explicitly selected working draft through the existing handoff flow; it does not upload the notebook.

#### Persistence contract

- One localStorage key per copy: `fin-flow:local-brief:v1:<uuid>`. No shared array rewrite can erase an unrelated copy created in another tab.
- Every save reads current records, deduplicates canonical editable content and checks the 20-slot limit. Invalid records are reported without modification and do not consume usable notebook slots. Simultaneous saves at the boundary can exceed 20; all successful copies are retained, and further saves are blocked. This is not a transactional database capacity guarantee.
- Records are size-bounded, validate IDs and dates, and reconstruct only the allowed fields. Cloud identity/revisions/entitlement fields are discarded.
- Storage events and window focus refresh the list. Storage failure is distinct from an empty notebook. Quota/read/delete failures leave the editor unchanged; no eviction or automatic repair runs.
- The existing automatically saved guest working draft remains under its original key, separate from explicit copies.

## Validation

Regression coverage exercises mixed-language search, result/selection separation, glossary links and explanations, replacement cancellation/undo, incomplete copies, duplicate prevention, file content, deletion confirmation, multi-tab updates, malformed storage, quota failure, account isolation and narrow screens. Local validation does not establish live identity-provider or billing activation.

Final integrated validation on 2026-09-23 passed: 114 unit/Worker tests and 167 desktop/mobile browser tests, with one desktop-only keyboard case skipped on mobile. Data validation, TypeScript, production/Worker builds and the deployment dry run passed. Rendered production-build checks at desktop and mobile sizes found no browser errors or page overflow; the glossary chunk was not requested on initial workspace load. Changes remain local; no deployment or provider activation was performed.
