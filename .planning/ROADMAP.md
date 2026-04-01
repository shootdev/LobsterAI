# Roadmap: LobsterAI Fork Sync and QZhuli Parity

## Overview

This roadmap is for a brownfield fork-maintenance effort, not a net-new product build. The work moves from establishing a safe upstream sync baseline, through preserving intentional QZhuli divergence, into local verification and documentation refresh. v1 ends when the local fork is synchronized, parity decisions are verified, and the sync references are updated for the next pass; pushing to `origin` is intentionally out of scope.

## Phases

- [ ] **Phase 1: Upstream Sync Baseline** - Integrate current upstream `main` into the local fork using existing sync references to resolve conflicts safely.
- [ ] **Phase 2: QZhuli Parity Preservation** - Reapply and retain intentional fork differences while keeping compatible upstream additions.
- [ ] **Phase 3: Local Verification & Parity Audit** - Prove the synced fork builds cleanly and matches documented keep/apply/ignore decisions.
- [ ] **Phase 4: Sync Documentation Refresh** - Record the completed parity pass and refresh the repo snapshot for future syncs.

## Phase Details

### Phase 1: Upstream Sync Baseline
**Goal**: Maintainer has a local fork state that includes current upstream `main` changes and resolves conflicts using existing fork-sync references rather than ad hoc guesses.
**Depends on**: Nothing (first phase)
**Requirements**: SYNC-01, SYNC-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can produce a local synchronized branch/worktree that includes current upstream `main` changes without deleting fork-only behavior during the merge or rebase step.
  2. Conflict resolutions in known hot spots are grounded in the repo snapshot and prior parity notes, so the maintainer can explain why each fork-specific path was kept or merged.
  3. No required sync work remains blocked on unresolved conflicts before parity-specific preservation begins.
**Plans**: TBD

### Phase 2: QZhuli Parity Preservation
**Goal**: The synchronized codebase still behaves as `Q助理电脑机器人`, preserving intentional fork branding, IM behavior, endpoints, assets, and compatible upstream additions.
**Depends on**: Phase 1
**Requirements**: SYNC-03, PAR-01, PAR-02, PAR-03
**Success Criteria** (what must be TRUE):
  1. Visible app naming and packaging surfaces affected by the sync still present the product as `Q助理电脑机器人` rather than reverting to upstream branding.
  2. QZhuli-specific IM platform identifiers, QR/bind flow behavior, and related runtime or UI wiring remain intact anywhere upstream touched the same areas.
  3. Fork-specific endpoints, assets, and intentional configuration defaults remain in place where the fork is meant to differ from upstream.
  4. Compatible upstream additions are present in the synced fork alongside the preserved QZhuli customizations instead of being dropped during conflict resolution.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Local Verification & Parity Audit
**Goal**: Maintainer can verify that the local synchronized fork builds successfully and that resulting keep/apply/ignore decisions match prior parity intent.
**Depends on**: Phase 2
**Requirements**: VER-01, VER-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can run the repository build successfully on the synchronized local state without unresolved merge artifacts breaking the flow.
  2. Maintainer can compare the resulting codebase against prior parity artifacts and confirm the expected keep/apply/ignore decisions in conflict-prone areas.
  3. Risky or stale fork behaviors that were intentionally excluded remain excluded, with no accidental reintroduction during the sync.
**Plans**: TBD

### Phase 4: Sync Documentation Refresh
**Goal**: The verified local sync is documented well enough that future sync passes can start from current parity decisions and repo state instead of rediscovering them.
**Depends on**: Phase 3
**Requirements**: DOC-01, DOC-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can open a dated `qzhuli-parity-pass-${date}.md` file and see what was kept, applied, ignored, or intentionally deferred in this sync pass.
  2. Maintainer can open the refreshed repo snapshot and find the fork's current state, conflict-prone files, and recurring build notes after the successful local sync.
  3. A future maintainer can begin the next upstream sync from the updated references without repeating the same parity analysis from scratch.
**Plans**: TBD

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| SYNC-01 | Phase 1 |
| SYNC-02 | Phase 1 |
| SYNC-03 | Phase 2 |
| PAR-01 | Phase 2 |
| PAR-02 | Phase 2 |
| PAR-03 | Phase 2 |
| VER-01 | Phase 3 |
| VER-02 | Phase 3 |
| DOC-01 | Phase 4 |
| DOC-02 | Phase 4 |

**Coverage:** 10/10 v1 requirements mapped exactly once.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Upstream Sync Baseline | 0/TBD | Not started | - |
| 2. QZhuli Parity Preservation | 0/TBD | Not started | - |
| 3. Local Verification & Parity Audit | 0/TBD | Not started | - |
| 4. Sync Documentation Refresh | 0/TBD | Not started | - |
