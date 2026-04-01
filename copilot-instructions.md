<!-- GSD:project-start source:PROJECT.md -->
## Project

**LobsterAI Fork Sync and QZhuli Parity**

This project is a brownfield maintenance and parity effort for the LobsterAI fork used as `Q助理电脑机器人`. The work focuses on syncing the fork with upstream changes while preserving the fork's QZhuli branding, custom IM flows, update endpoints, and other fork-specific behavior that should remain intact after upstream integration.

**Core Value:** Bring in valuable upstream changes without regressing the fork's `Q助理电脑机器人` identity, QZhuli integrations, or release behavior.

### Constraints

- **Tech stack**: Keep the existing Electron + React + TypeScript architecture — this is a fork sync, not a stack migration
- **Compatibility**: Preserve QZhuli platform identifiers, IM bind flows, and release endpoints where the fork intentionally differs from upstream
- **Verification**: Changes must pass the repository build flow and any relevant checks already used by this codebase
- **Process**: Use the sync-fork-and-check workflow artifacts as the source of truth for conflict-prone files and previous parity decisions
- **Documentation**: A dated parity summary and refreshed repo snapshot must be produced as part of the completed work
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
