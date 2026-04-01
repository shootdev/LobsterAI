# Requirements: LobsterAI Fork Sync and QZhuli Parity

**Defined:** 2026-04-01
**Core Value:** Bring in valuable upstream changes without regressing the fork's `Q助理电脑机器人` identity, QZhuli integrations, or release behavior.

## v1 Requirements

### Sync

- [ ] **SYNC-01**: Maintainer can integrate current upstream `main` changes into the local fork branch without deleting fork-only behavior
- [ ] **SYNC-02**: Maintainer can resolve merge or rebase conflicts using the existing repo snapshot and parity references as the source of truth
- [ ] **SYNC-03**: Maintainer can retain upstream additions that are compatible with the fork during the sync pass

### Parity

- [ ] **PAR-01**: Maintainer can preserve the product name `Q助理电脑机器人` in visible branding and packaging surfaces affected by the sync
- [ ] **PAR-02**: Maintainer can preserve QZhuli-specific IM platform identifiers, bind flow behavior, and related UI/runtime wiring affected by the sync
- [ ] **PAR-03**: Maintainer can preserve fork-specific endpoints, assets, and configuration values where the fork intentionally differs from upstream

### Verification

- [ ] **VER-01**: Maintainer can run the repository build successfully after the sync and conflict resolution work
- [ ] **VER-02**: Maintainer can verify keep/apply/ignore decisions against prior parity artifacts and the resulting codebase

### Documentation

- [ ] **DOC-01**: Maintainer can generate a dated parity summary file named `qzhuli-parity-pass-${date}.md` describing what was kept, applied, ignored, or intentionally deferred
- [ ] **DOC-02**: Maintainer can update the repo snapshot in `SKILLs/sync-fork-and-check/references/` with the fork's current state, conflict-prone files, and recurring build notes after a successful sync

## v2 Requirements

### Release Operations

- **REL-01**: Maintainer can push the synchronized branch to `origin` as part of the same workflow
- **REL-02**: Maintainer can automate the full parity audit and documentation update as a repeatable one-command workflow

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pushing synced changes to `origin` in this pass | User explicitly scoped this milestone to stop at verified local sync plus docs |
| Broad feature development unrelated to upstream sync/parity | This milestone is about safe fork synchronization, not general product expansion |
| Rebranding the fork back to upstream naming | Preserving QZhuli identity is a core requirement |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SYNC-01 | Unmapped | Pending |
| SYNC-02 | Unmapped | Pending |
| SYNC-03 | Unmapped | Pending |
| PAR-01 | Unmapped | Pending |
| PAR-02 | Unmapped | Pending |
| PAR-03 | Unmapped | Pending |
| VER-01 | Unmapped | Pending |
| VER-02 | Unmapped | Pending |
| DOC-01 | Unmapped | Pending |
| DOC-02 | Unmapped | Pending |

**Coverage:**
- v1 requirements: 10 total
- Mapped to phases: 0
- Unmapped: 10 ⚠️

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after initial definition*
