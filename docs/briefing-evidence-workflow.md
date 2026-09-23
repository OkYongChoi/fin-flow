# Evidence and repeat-use briefing workflow

## Audience and journey

Public exploration serves people curious about finance as well as product, operations and education practitioners. The default data view links to an everyday-question entry in the workspace. Three everyday starters cover cross-border payment messages, card/bank-transfer roles and digital-dollar transfers; the existing professional templates remain available. These questions choose existing catalog flows, not consumer product recommendations or a universal local-bank-transfer model.

The journey is: choose a question → compare scope/participants/boundaries → inspect original sources and dates → explain it in your own words → export or keep an editable backup. The reading guide explains scope, participants, limits, snapshot versions, coverage periods and retrieval dates. Author notes remain separate from source-backed content.

## Evidence contract

`buildBriefEvidence` in `src/briefEvidence.ts` supplies both the rendered comparison and Markdown generator. Only selected networks contribute metrics and sources. Existing edge-linked structural sources remain available when a network has no metrics. Missing metrics are described as unavailable, never as zero; missing source records are called out. No rankings, normalized values or summed network totals are calculated.

Each metric retains its catalog display, unit and covered period, plus its source URL and retrieval date when present. Snapshot version/review deadline remain visible; an expired review deadline shows the existing warning. Static snapshot entries and recorded retrieval dates are not a fresh verification of the remote website. Process-reference links without retrieval metadata are explicitly labeled. Network scope, roles, stages and boundaries use existing bilingual guides.

## Three distinct outputs

- **Markdown:** current snapshot comparison, selected metrics, process steps, source citations, date metadata and escaped author notes.
- **Print / PDF:** the browser's print dialog, with the editor/account controls excluded. Collapsed process/source sections open for printing and return to their prior state afterward. Source URLs are printed alongside links. PDF saving depends on the browser's available print destination.
- **Editable backup:** a version 1 JSON envelope with the format `flow-of-money-brief` and only title, notes, network IDs and document language. This preserves incomplete drafts, including empty titles/selections. It does not include archived source documents, account identity, cloud record ID/revision or entitlement. Opening uses the currently loaded snapshot.

Imports reject malformed/foreign/version-mismatched/oversized (100 KiB) files and invalid draft content before changing the editor. Imports use the same confirmation and undo path as templates or saved documents. Failed imports retain the current draft. File parsing does not send content to a server. Backup notices distinguish local files from account storage.

When reopening an account document, the workspace shows its saved snapshot version alongside the current preview and offers its original Markdown. Editing does not silently replace that archived document; existing explicit save and revision-conflict handling remain in force.

## Boundaries and validation

Public comparison, export, printing and file recovery work without provider activation. Clerk/Creem/Worker/D1 production activation remains tracked separately in issue #200; none of these UI additions enables sales or proves paid demand.

Coverage includes selected-network isolation, missing evidence, Markdown escaping, bilingual starters, incomplete/invalid backups, delayed file-read draft preservation, replacement cancellation/undo, responsive overflow, print disclosure restoration, existing account handoff/conflict tests, and desktop/mobile browser journeys. No catalog metrics or snapshot/source timestamps were changed in this implementation.


The CHIPS/Fedwire explanatory guide was also reviewed against the [CHIPS operator overview](https://www.theclearinghouse.org/payment-systems/chips), [Fedwire Funds Service overview](https://www.frbservices.org/financial-services/wires), and [Fedwire disclosure, page 16](https://www.frbservices.org/binaries/content/assets/crsocms/financial-services/wires/funds-service-disclosure.pdf) on 2026-09-23. The guide distinguishes the two systems, operator/bank roles, interbank settlement and onward customer credit. The caution about customer-credit timing follows from those separate stages; it is not a processing-time promise.
