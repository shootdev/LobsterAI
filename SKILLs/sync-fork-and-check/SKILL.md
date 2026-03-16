---
name: sync-fork-and-check
description: Sync a forked repository with its upstream and verify the build. Use this skill whenever the user needs to pull upstream changes into their fork and confirm the project still builds cleanly.
---

# Sync Fork and Check

This skill syncs a forked repository with its upstream and verifies the build.

The agent executing this skill must:

1. **Read** any existing repo snapshot in `references/repo-snapshot-*.md` before touching anything.
2. **Generate** (or update) that snapshot as part of every successful sync — it is the persistent memory that makes the next sync faster.

---

## Step 0 — Load the repo snapshot

Check whether a snapshot already exists:

```bash
ls SKILLs/sync-fork-and-check/references/repo-snapshot-*.md 2>/dev/null
```

**If a snapshot exists** — read it in full before proceeding. It contains the conflict-prone file list, per-file resolution rules, fork-specific features to preserve, and known build artifacts specific to this project.

**If no snapshot exists** — note this and plan to create one in Step 8 after a successful sync. Gather context now to populate it:

```bash
git remote -v                                              # fork + upstream URLs
git log --oneline upstream/main ^HEAD                      # ahead commits (fork-only)
git diff HEAD...upstream/main --stat                       # what upstream changed
cat package.json | grep '"version"' | head -1             # fork version
git log --oneline -1 upstream/main                        # upstream HEAD
git tag --sort=-version:refname | head -5                 # upstream release tags
```

---

## Step 1 — Pre-merge analysis

Before merging, understand what is coming in:

```bash
git fetch upstream
git log --oneline upstream/main ^HEAD        # new upstream commits
git diff HEAD...upstream/main --stat          # files that will change
git rev-list --left-right --count upstream/main...HEAD  # N behind · M ahead
```

Compare the changed files against the **conflict-prone file list** in the snapshot (if present). Flag any file that appears in both lists — those will need careful resolution.

---

## Step 2 — Stash local changes

```bash
git stash push -m "local-dev-tweaks: <brief description>"
```

---

## Step 3 — Merge

```bash
git checkout main
git merge upstream/main
```

---

## Step 4 — Resolve conflicts

For each conflicted file, apply the rule from the repo snapshot. If no snapshot rule exists for a file, fall back to these general principles:

| Conflict type                            | Default strategy                        |
| ---------------------------------------- | --------------------------------------- |
| Union / enum types                       | Keep **all** variants from both sides   |
| New feature code blocks                  | Keep **both** blocks                    |
| Branding / product name                  | Keep the **fork's** copy                |
| Upstream-only infra (URLs, build config) | Take **upstream** unless fork overrides |
| Formatting-only change                   | Take **upstream's** formatting          |

After resolving all files:

```bash
git add <resolved-files>
git commit -m "feat: merge upstream/main (vX.X.X) - <summary of upstream additions>"
```

---

## Step 5 — Restore local changes

```bash
git stash pop
# If there are stash conflicts: resolve → git add → git stash drop
```

---

## Step 6 — Install dependencies

Upstream may have added new packages:

```bash
npm install --force
```

---

## Step 7 — Build check

```bash
npm run build
```

Common post-merge build failures and fixes:

| Symptom                                      | Fix                                        |
| -------------------------------------------- | ------------------------------------------ |
| Literal `\n` strings inside a `.tsx`/`.ts`   | Expand to proper multi-line code           |
| Code block placed outside its method         | Check brace nesting depth around the block |
| Duplicate object keys (esbuild warning)      | Remove the duplicate key                   |
| Missing module import (Rollup/esbuild error) | `npm install --force`, then rebuild        |

If the build fails, fix the issues and re-run `npm run build`. Do not proceed to Step 8 until the build is clean.

---

## Step 8 — Generate / update the repo snapshot

**This step is mandatory after every successful sync.**

The snapshot lives at:

```
SKILLs/sync-fork-and-check/references/repo-snapshot-<project-name>.md
```

### If creating for the first time

Create the file with the following sections (populate every section from the data gathered in Step 0 and from the conflict resolution work just done):

```markdown
# Repo Snapshot — <fork-owner>/<repo-name>

> Read this file before every sync. Update it after every successful sync.

## Identity

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| Fork                 | `<fork-remote-url>`                         |
| Upstream             | `<upstream-remote-url>`                     |
| Fork product name    | <product name, if different from repo name> |
| Fork version         | <version from package.json>                 |
| Build command        | `npm run build`                             |
| Runtime requirements | <e.g. Node >=24 <25>                        |

## Current state (as of <YYYY-MM-DD>)

|                     | Commit             | Note                      |
| ------------------- | ------------------ | ------------------------- |
| Fork HEAD           | `<sha7>`           | <commit subject>          |
| Last upstream merge | `<sha7>`           | merged upstream vX.X.X    |
| upstream/main HEAD  | `<sha7>`           | tag `vX.X.X`              |
| origin/main         | `<sha7>`           | <pushed / not yet pushed> |
| Divergence          | N behind · M ahead |                           |

### Ahead commits (fork → upstream, newest first)

\`\`\`
<output of: git log --oneline upstream/main..HEAD>
\`\`\`

## Fork-specific features (always preserve)

List every feature, integration, or customisation that the fork adds on top of
upstream. For each entry record:

- Which files implement it
- What must NOT be overwritten during conflict resolution

## Known conflict-prone files

| File   | Why it conflicts | Resolution rule                             |
| ------ | ---------------- | ------------------------------------------- |
| <path> | <reason>         | <keep both / keep fork / take upstream / …> |

## Common post-merge build artifacts

List any recurring build failures discovered in past syncs and how to fix them.

## Upstream release tags (for reference)

\`\`\`
<output of: git tag --sort=-version:refname | head -10>
\`\`\`
```

### If updating an existing snapshot

Run the following commands and update the corresponding sections:

| Section to update              | Command to run                                                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Current state** table        | `git log --oneline -1 HEAD` / `git log --oneline -1 upstream/main` / `git rev-list --left-right --count upstream/main...HEAD` |
| **Ahead commits** list         | `git log --oneline upstream/main..HEAD`                                                                                       |
| **Fork version**               | `grep '"version"' package.json`                                                                                               |
| **Known conflict-prone files** | Add any new files that conflicted this time; update rules if the resolution strategy changed                                  |
| **Common build artifacts**     | Add any new failure patterns encountered during this sync                                                                     |
| **Upstream release tags**      | `git tag --sort=-version:refname \| head -10`                                                                                 |
| **Date** in the heading        | today's date                                                                                                                  |

---

## Step 9 — Push

```bash
git push origin main
```

---

## Script

A convenience shell script at `scripts/sync-fork-and-check.sh` automates Steps 1–7. On conflict it prints the conflict-prone file list and resolution hints sourced from the snapshot (if present). Run it for routine syncs; use the manual steps above when the merge is complex.

---

## Notes

- **Always stash first** — uncommitted changes interfere with conflict resolution.
- Fork divergence grows over time; the more frequently you sync, the fewer conflicts accumulate.
- The newer the merge base, the fewer conflicts next time.
- The repo snapshot is the skill's long-term memory — keep it accurate.
