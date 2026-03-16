#!/bin/bash

# sync_fork_and_check.sh
# Generic script: sync a forked repository with its upstream and verify the build.
# Repo-specific conflict rules live in ../references/repo-snapshot-*.md

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SNAPSHOT=$(ls "$SKILL_DIR/references/repo-snapshot-"*.md 2>/dev/null | head -1)

echo "=== Sync Fork and Check ==="

# Print repo snapshot hint if available
if [ -n "$SNAPSHOT" ]; then
    echo "📋 Repo snapshot: $SNAPSHOT"
    echo "   Read it for conflict resolution rules specific to this fork."
fi
echo ""

# Check upstream remote exists
if ! git remote | grep -q "^upstream$"; then
    echo "⚠️  No 'upstream' remote found."
    echo "Add one first:  git remote add upstream <upstream-repo-url>"
    exit 1
fi

# 1. Fetch and preview incoming changes
echo "📊 Fetching upstream..."
git fetch upstream

NEW_COMMITS=$(git rev-list --count HEAD..upstream/main)
if [ "$NEW_COMMITS" -eq 0 ]; then
    echo "✅ Already up to date — nothing to sync."
    exit 0
fi

echo "Upstream has $NEW_COMMITS new commit(s):"
git log --oneline HEAD..upstream/main
echo ""
echo "Files that will change:"
git diff HEAD...upstream/main --stat | tail -25
echo ""

# 2. Stash local changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📦 Stashing local changes..."
    git stash push -m "local-dev-tweaks: pre-sync $(date +%Y%m%d-%H%M)"
    STASHED=1
else
    STASHED=0
fi

# 3. Merge
echo "🔄 Merging upstream/main..."
git checkout main
if git merge upstream/main; then
    echo "✅ Merge complete — no conflicts."
else
    echo ""
    echo "⚠️  Merge conflicts detected. Conflicted files:"
    git diff --name-only --diff-filter=U
    echo ""
    if [ -n "$SNAPSHOT" ]; then
        echo "📖 Open the repo snapshot for resolution rules:"
        echo "   $SNAPSHOT"
    else
        echo "📖 General rules (see SKILL.md §4):"
        echo "  • Union/enum types   → keep ALL variants from both sides"
        echo "  • New feature blocks → keep BOTH blocks"
        echo "  • Branding           → keep the fork's copy"
        echo "  • Upstream-only URLs → take upstream unless fork overrides"
    fi
    echo ""
    echo "After resolving all conflicts:"
    echo "  git add <resolved-files>"
    echo "  git commit"
    [ "$STASHED" -eq 1 ] && echo "  git stash pop"
    exit 1
fi

# 4. Restore local changes
if [ "$STASHED" -eq 1 ]; then
    echo "📤 Restoring local changes..."
    if git stash pop; then
        echo "✅ Local changes restored."
    else
        echo "⚠️  Conflicts while restoring stash — resolve them, then: git stash drop"
    fi
fi

# 5. Install dependencies (upstream may have added packages)
echo ""
echo "📦 Installing dependencies..."
npm install --force --no-fund 2>/dev/null || npm install --engine-strict=false --force --no-fund

# 6. Build check
echo ""
echo "🔨 Running build check..."
if npm run build; then
    echo ""
    echo "✅ Build succeeded!"
    echo ""
    echo "Next steps:"
    echo "  1. Update the repo snapshot in: $SKILL_DIR/references/"
    echo "     - Set new 'Last synced upstream version'"
    echo "     - Refresh the 'Ahead commits' list"
    echo "  2. git push origin main"
else
    echo ""
    echo "❌ Build failed — check the error output above."
    echo "Common post-merge build issues:"
    echo "  • Literal \\n in .tsx/.ts file  → expand to proper multi-line code"
    echo "  • Code block outside its method → check brace nesting"
    echo "  • Duplicate object key          → remove the duplicate"
    echo "  • Missing npm package           → npm install --force"
    [ -n "$SNAPSHOT" ] && echo "  • See also: $SNAPSHOT (section: Common post-merge build artifacts)"
    exit 1
fi

echo "=== Done ==="
