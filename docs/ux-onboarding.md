# Briefing workspace UX and onboarding

Audit and implementation: 2026-09-22. Issue [#202](https://github.com/OkYongChoi/fin-flow/issues/202), continuing PR #201. Product goal: a practitioner can turn an exploration into a useful, cited brief, then return to and reuse that work. Existing visual tokens and public research access are retained.

## Audit evidence and changes

The current local built Worker was captured before changes at 1440×1000 and 390×844. These are observations from this run, not a retrospective assessment of old screenshots. The in-app browser was unavailable (`Browser is not available: iab`; no registered browsers), so the existing local Playwright workflow was used.

| Step | Observed issue | Resulting behavior |
| --- | --- | --- |
| 1. First visit / exploration | Before capture `01-entry-before.png`: a large hero, no task-oriented starting choice, and a long catalog of networks. Exploration had no direct handoff. | Three optional starting templates (payment explanation, issuance comparison, lesson); explore-to-brief action offers the selected network without replacing existing work. |
| 2. Edit and switch tasks | `02-reset-before.png`: clicking New draft after entering title/notes immediately replaced them, with no confirmation or undo. | Native confirmation dialog, Escape and safe initial focus, export-before-replace and one replacement undo. Incomplete title/network selection survives reload. |
| 3. Review and export | `04-mobile-before.png`: preview and result feedback required substantial scrolling; blocked cloud save was a dead end. | Three-step navigation, explicit preview focus target, feedback next to actions, source retry, actionable Pro explanation and a shorter returning-user path. |
| 4. Sign in / pay | `03-plans-before.png`: annual terms and unavailable-sales state were clear. Code inspection showed guest draft reset on sign-in and signed-in edits lost on reload. | Explicit Sign in and continue stages the draft for one account; account drafts have separate tab-scoped recovery. Pricing/navigation preserves work; document language is independent of interface language. Live provider behavior remains unverified. |
| 5. Return / reuse | Saved list had open/export/delete only; cloud writes silently replaced concurrent edits. These were code findings, not screenshots of a real paid account. | Search, sort, duplicate as a new draft, archived-copy export, conditional cloud writes, retained edits during saves, and conflict recovery by export or separate copy. |

Captured screenshots are held outside the repository in `/tmp/fin-flow-ux-audit/`, with before/after evidence supplied in the task. No personal customer data was used. Authenticated component tests use fixtures and must not be presented as real Clerk/Creem activation.

## Onboarding path

1. **Enter:** open Briefings or choose Create a brief with this network from the explorer. A query parameter is a suggestion, not permission to overwrite the current draft.
2. **Choose:** use a task template or Continue draft. A returning edited draft starts with templates collapsed; reopening them never destroys work.
3. **Personalize:** edit title, choose 1–4 networks and add notes. Templates contain prompts rather than invented financial claims. Empty title/selection is allowed during drafting but blocks export/save with a visible explanation.
4. **Review:** jump to the focusable preview; check linked sources and coverage date. A source failure has an in-place retry. UI language switching does not silently translate a document.
5. **Use:** export a cited Markdown brief for free. Status confirms the action and offers the next task. Exported status resets when the document changes.
6. **Retain:** users who need cross-device reuse can inspect Pro or explicitly carry their guest draft through sign-in. Cloud storage is a separate action; a local backup is never labeled a cloud save.
7. **Return:** reopen or search saved briefs; duplicate a prior brief as a new starting point. Save updates only the version loaded by this editor. If another device changed/deleted it, keep current edits and let the user export or save separately.

## Draft and concurrency contract

- Guest: one automatically saved browser-local draft under the existing v1 key, plus explicit browser notebook copies under separate v1 keys. Incomplete drafts are supported. The notebook is guest-only, visible to anyone using the browser, and does not sync across devices; see `docs/learning-and-local-notebook.md`.
- Signed-in: per-user v2 working envelope in sessionStorage (this tab only), including document ID, loaded version and saved fingerprint. Closing the tab can remove this temporary copy; only successful cloud save persists across devices.
- Explicit sign-in handoff: staged in the same tab, expires after one hour and is claimed by the first signed-in user. An existing account draft wins; the staged draft is offered with replacement confirmation. Account switching does not import another user's temporary draft.
- Storage failures are visible and trigger a leave-page warning. Guest's original browser copy is retained through handoff. No local token or paid entitlement is stored in the draft.
- Replacement undo lasts until a subsequent edit. Templates/open/new/duplicate all share the replacement guard. Actions that change document identity wait for the current network operation to finish.
- Client API calls send `X-Expected-User`; the Worker compares it with the verified JWT subject to reject an account switch during token retrieval.
- Updates send `If-Match` with the loaded `updatedAt`. The Worker uses an atomic owner/version predicate and a strictly increasing revision. Deleted documents are not recreated by stale edits. Identical retries return the already-stored document without another write.
- The create limit remains 50. A lost create response can be retried using the same in-memory ID. A reload after an ambiguous response may require looking in My briefs before creating another copy; no background sync/outbox is implemented.
- A successful save acknowledges the submitted version only. Edits typed while the request was in flight remain in the editor and are marked as not yet saved.

## SaaS expansion boundaries

| Stage | Scope | Evidence / prerequisite |
| --- | --- | --- |
| Current individual workflow | Onboarding templates, draft continuity, private library search/reuse, version conflicts, free export and existing Pro limit | Current automated and rendered checks; live activation remains #200 |
| Launch readiness | Actual Clerk sign-in/account switch, Creem lifecycle, signed provider events, customer support and account/data-deletion procedure | Dated test/production evidence before enabling sales; account deletion is not implemented by this change |
| Personal organization | User-created templates, collections/tags, source-refresh comparison, optional revision history | Repeat use and saved-brief volume from actual customers; owner-scoped schema, migration and export behavior defined before implementation |
| Team workspace | Invites, roles, shared collections and reviewer workflow | Explicit workspace membership checked server-side; ownership migration, revocation, audit history and a separate team billing model |
| Integrations | User-selected document export to another tool or a scoped API | Explicit destination/permission, versioned API and revocation; no automatic publication of private notes |

The current owner-scoped database is not a team-permission model. Do not substitute a client-side workspace selector or a Clerk organization ID for membership authorization. Likewise, a Pro subscription must not silently grant team seats or public sharing.

The UI advertises only implemented individual functionality. Team plans, AI generation, public sharing, live feeds, automatic source monitoring and notifications remain out of scope. No new price or acquisition gate is enabled.

## Measurement and validation

Use the initial five-user validation from the monetization plan. Observe: time to first useful exported brief, template choice vs manual start, recovery success, repeat usage, saved-copy reuse, and whether users can explain browser backup versus cloud storage. Pricing visits are not purchases. No analytics or user-note collection is installed by this change.

Regression coverage includes template use, replacement cancellation/undo, keyboard focus, 320px width, explorer handoff, incomplete-draft recovery, interface/document locale separation, source retry, account draft isolation, search/duplication, in-flight edits, stale/deleted document conflicts and token-account switching. Screenshots alone do not establish accessibility compliance; native controls, keyboard checks and meaningful labels are included, while a full assistive-technology audit and real provider flows remain separate.
