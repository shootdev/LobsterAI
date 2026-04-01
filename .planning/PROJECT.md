# LobsterAI Fork Sync and QZhuli Parity

## What This Is

This project is a brownfield maintenance and parity effort for the LobsterAI fork used as `Q助理电脑机器人`. The work focuses on syncing the fork with upstream changes while preserving the fork's QZhuli branding, custom IM flows, update endpoints, and other fork-specific behavior that should remain intact after upstream integration.

## Core Value

Bring in valuable upstream changes without regressing the fork's `Q助理电脑机器人` identity, QZhuli integrations, or release behavior.

## Requirements

### Validated

- ✓ Electron + React desktop assistant app already exists and builds from this repository — existing
- ✓ Cowork mode, artifacts, IM integrations, and local persistence already exist in the current codebase — existing
- ✓ QZhuli-specific branding and IM/bind flows have previously been implemented in this fork — existing

### Active

- [ ] Sync the fork with upstream changes from `netease-youdao/LobsterAI`
- [ ] Preserve QZhuli-specific branding, product naming, endpoints, assets, and IM behavior during conflict resolution
- [ ] Restore or retain upstream-added features that are compatible with the fork
- [ ] Verify the merged result with a clean build and targeted parity review
- [ ] Generate a dated parity summary file named `qzhuli-parity-pass-${date}.md` after the sync
- [ ] Update the repo snapshot used by the sync workflow so future syncs are faster and safer

### Out of Scope

- Rewriting unrelated product areas not affected by upstream sync or fork parity — this effort is a sync/parity pass, not a broad redesign
- Removing QZhuli-specific customizations to match upstream branding — preserving fork identity is the point of the work
- Destructive legal or branding rewrites outside the intended visible product surfaces — prior parity notes explicitly treated some older changes as stale or risky

## Context

This repository is the `shootdev/LobsterAI` fork of `netease-youdao/LobsterAI`. The fork has established divergence around QZhuli branding (`Q助理电脑机器人`), QZhuli IM gateway support, QR bind flows, custom update endpoints, app assets, and some packaging/runtime defaults. Existing sync memory lives in `SKILLs/sync-fork-and-check/references/repo-snapshot-lobsterai.md`, and a prior parity audit exists at `SKILLs/sync-fork-and-check/references/qzhuli-parity-pass-2026-03-23.md`.

The requested work is not just "merge upstream" mechanically. It requires an explicit keep/apply/ignore review of ahead commits and conflict-prone files so that upstream improvements land without regressing fork-specific behavior. A successful outcome includes persistent documentation of what was preserved, what was reapplied, and what was intentionally left out.

## Constraints

- **Tech stack**: Keep the existing Electron + React + TypeScript architecture — this is a fork sync, not a stack migration
- **Compatibility**: Preserve QZhuli platform identifiers, IM bind flows, and release endpoints where the fork intentionally differs from upstream
- **Verification**: Changes must pass the repository build flow and any relevant checks already used by this codebase
- **Process**: Use the sync-fork-and-check workflow artifacts as the source of truth for conflict-prone files and previous parity decisions
- **Documentation**: A dated parity summary and refreshed repo snapshot must be produced as part of the completed work

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat this as a brownfield sync/parity project, not a net-new feature project | The user asked to sync the fork with upstream and preserve fork-specific behavior | — Pending |
| Use the existing sync skill references as canonical context | The repo already contains a snapshot and a recent parity pass with explicit preservation rules | — Pending |
| Optimize for upstream parity with QZhuli behavior preserved | The user said the most important success criterion is upstream parity without losing Q助理 branding/features | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
