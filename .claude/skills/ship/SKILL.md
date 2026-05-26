---
name: ship
description: Branch-per-turn workflow for this repo. Phase A (auto): branch from synced `dev` as `claude/<type>-<slug>`, commit (conventional-commits), push, stop. Phase B (only after user confirms — "ship it" / "merge it" / "ok ship" / etc.): PR to `dev`, squash-merge with `--admin --delete-branch`, return to a synced `dev`. Skip for read-only turns and `.claude/plans/*`. Invoke Phase A automatically — wait only to open the PR.
---

# Branch-per-turn ship (two phases)

The only way changes land in this repo. Phase A runs automatically; Phase B waits for explicit chat confirmation.

## When to run

RUN if the turn edits any file tracked by this repo (code, tests, configs, docs, migrations, Prisma schema, `.claude/`).

SKIP if the turn:
- Only reads / answers / explores / runs dry commands.
- Only writes to `.claude/plans/*` (planning artifacts aren't shippable).
- Only edits files outside the working tree (e.g. `~/.claude/…`).

## Phases

- **Phase A — automatic.** Steps 1–7. Ends with the branch pushed and a report to the user.
- **Phase B — chat-confirmed.** Steps 8–11. Only after the user says one of: `ship it`, `ship`, `merge it`, `merge`, `ok ship`, `okay ship`, `go`, `lgtm ship`, `it's ok to ship`. If unsure whether the user is confirming or asking for changes — ASK; don't open a PR on a guess.

User replies with *changes* instead of confirmation → new turn → new `claude/…` branch (don't amend or re-push the prior one).
User bundles edits **and** confirmation in one message ("fix X and ship it") → run A, push, then run B in the same turn.

## Steps

### 1. Pre-flight

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
```

If there are uncommitted changes at turn start → STOP and ask the user. Never auto-stash or discard. Otherwise:

```bash
git checkout dev && git pull origin dev
```

### 2. Pick ONE conventional-commits type

| Type       | Use for                                         |
|------------|-------------------------------------------------|
| `feat`     | User-facing feature / endpoint / page           |
| `fix`      | Bug fix in existing behavior                    |
| `refactor` | Restructure without behavior change             |
| `perf`     | Performance improvement                         |
| `test`     | Add/update tests only                           |
| `docs`     | Documentation / comments only                   |
| `style`    | Formatting / whitespace, no code change         |
| `build`    | Build system / dependencies / bundler           |
| `ci`       | CI config, GitHub Actions, deploy configs       |
| `chore`    | Tooling, renames, cleanups, process changes     |
| `revert`   | Reverting a prior commit                        |

If a turn spans two types, pick the one that best describes the **primary** intent.

### 3. Branch name: `claude/<type>-<slug>`

- **slug**: 2–5 kebab-case words, distinctive nouns/verbs, no articles, ≤ 50 chars after `claude/`.
- ✅ `claude/feat-live-demo-page`, `claude/fix-session-token-race`
- ❌ `claude/feat-add-the-new-page-for-demo` (too long, articles, redundant verb)

Collision check + suffix on hit:

```bash
git ls-remote --exit-code --heads origin "claude/<type>-<slug>" \
  && BRANCH="claude/<type>-<slug>-$(date +%H%M)" \
  || BRANCH="claude/<type>-<slug>"
```

### 4. Branch + edit

```bash
git checkout -b "$BRANCH"
```

Make all edits now. Run local verification where it makes sense (`npm run type-check`, tests).

### 5. Commit

Stage explicit paths only (never `git add -A` / `git add .`):

```bash
git add <paths>
git commit -m "$(cat <<'EOF'
<type>: <imperative short summary>

<optional body — explain the WHY, not the what. Skip if the diff is self-evident.>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

Rules:
- Subject ≤ 72 chars, imperative mood, lowercase after the colon.
- Subject type MUST match the branch type.
- Pre-commit hook fails → fix, re-stage, make a **new** commit (never `--amend` unless the user asks).

### 6. Push

```bash
git push -u origin "$BRANCH"
```

### 7. STOP — report and wait

Phase A ends here. **Do not** open a PR, switch to `dev`, or delete the branch. Final message must include:

- Branch URL on GitHub. Derive from `git remote get-url origin` (`git@github.com:OWNER/REPO.git` or `https://github.com/OWNER/REPO.git` → `https://github.com/OWNER/REPO/tree/<branch>`).
- The commit subject (`<type>: <summary>`).
- A 1–3 bullet diff summary.
- Prompt: *"Say `ship it` when you're ready to open a PR and squash-merge to `dev`."*

Then stop. No polling, no re-push.

---

**Phase B — only after a confirmation phrase.** If confirmation arrives in the same turn as Phase A, continue straight through.

### 8. Open the PR against `dev`

```bash
gh pr create --base dev --head "$BRANCH" \
  --title "<type>: <same summary as commit subject>" \
  --body "$(cat <<'EOF'
## Summary
- <1–3 bullets of what changed>

## Test plan
- [ ] <what to verify>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 9. Squash-merge

```bash
gh pr merge --squash --admin --delete-branch
```

`--admin` bypasses branch protection (per user preference — skip CI) and `--delete-branch` removes the remote `claude/` branch. If `--admin` fails (not an admin on the repo), fall back to `gh pr merge --auto --squash --delete-branch` and tell the user.

### 10. Return to a synced `dev`

```bash
git checkout dev && git pull origin dev && git branch -D "$BRANCH"
```

End on `dev`, in sync with `origin/dev`, no stale local `claude/` branches.

### 11. Report

Final message: include the merged PR URL (`gh pr view --json url -q .url` if needed).

## Failure handling

If any step (push, PR create, merge) fails: **leave state as-is** — stay on the `claude/` branch, don't delete it, don't switch to `dev`. Report which step failed and the exact manual command to finish (e.g. `git push -u origin <branch>`, `gh pr create --base dev --head <branch> …`, `gh pr merge <N> --squash --admin --delete-branch`).

If there is no GitHub remote or `gh` is not authenticated, stop after the local commit and tell the user — don't attempt workarounds.

## Multi-turn iteration

User wants changes after a merged PR → new turn → new branch (`claude/fix-…` or `claude/refactor-…`). Don't re-open or amend a merged PR.

## What NOT to do

- Push directly to `dev` / `master`, or commit on `dev` locally.
- `git add -A` / `git add .` — stage specific paths.
- `--no-verify` or `--amend` unless the user explicitly asks.
- Bundle unrelated work into one branch — if a turn has two independent tasks, ask whether to split.
- Run this workflow for turns that didn't edit project files.
- **Open a PR or merge without an explicit confirmation phrase.** Pushing the `claude/` branch is fine; anything that creates visible state on `dev` requires the user's go-ahead.
