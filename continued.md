# Slopify - Session Handoff

## What is Slopify?
A website hosting small frontend apps where new apps are built by Claude via GitHub Actions. Users submit app requests as GitHub issues, maintainer adds "approved" label, Claude implements and creates PR, auto-merges after CI passes.

**Live site:** https://slopify.felixweinberger.com

**GitHub repo:** https://github.com/felixweinberger/slopify

---

## What's Been Built (Complete)

### Phase 1: Repo + Deployment ✅
- Landing page with app registry
- Cloudflare Pages deployment
- Custom domain configured
- Build script for registry.json

### Phase 2: Claude Integration ✅
- `.github/workflows/claude-build.yml` - Triggers Claude on "approved" label
- `.github/workflows/ci.yml` - Runs build on PRs
- `.github/workflows/auto-merge.yml` - Enables auto-merge for Claude PRs
- `.github/workflows/close-issue.yml` - Closes linked issue when PR merges
- `.github/workflows/pr-gatekeeper.yml` - Auto-closes PRs from unauthorized users
- `.github/workflows/fix-conflicts.yml` - Detects and fixes merge conflicts via Claude
- `CLAUDE.md` - Project guidelines for Claude
- Branch protection with required status checks
- `ANTHROPIC_API_KEY` in repo secrets

### Issue Templates ✅
- 🆕 New App - request a new app
- ✨ Feature Request - enhance existing apps
- 🐛 Bug Report - report bugs

### Security ✅
- Only `claude[bot]` and `felixweinberger` can have open PRs
- Only repo owner can add "approved" label (write access required)
- Unauthorized PRs auto-closed with friendly message

---

## Current State

### Apps Built
1. **Counter** - merged and live at `/apps/counter/`
2. **Calculator** - PR in progress (check `add-calculator-app` branch)

### Open Items
- Check if Calculator PR merged successfully
- Issue #1 may still be open (close manually if needed)

---

## What's Next

### Phase 3: Test & Iterate
- [ ] Verify calculator app works
- [ ] Test another app request end-to-end
- [ ] Iterate on CLAUDE.md if Claude makes mistakes

### Phase 4: In-App Requests, Auth & Storage (Future)
Full plan in `/plan.md` under "Phase 4" section. Summary:

- **Auth:** GitHub OAuth via Cloudflare Pages Functions
- **Storage:** Cloudflare D1 + Drizzle ORM for migrations
- **Flow:** Users log in with GitHub → submit requests directly in app → creates GitHub issue

Key files to create:
```
/functions/auth/github/index.ts      - Start OAuth
/functions/auth/github/callback.ts   - Handle callback
/functions/api/me.ts                 - Current user
/functions/api/submit-request.ts     - Create issue
/src/db/schema.ts                    - Drizzle schema
/drizzle.config.ts                   - Drizzle config
/wrangler.toml                       - D1 binding
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/plan.md` | Full implementation plan with Phase 4 details |
| `/CLAUDE.md` | Guidelines for Claude when building apps |
| `/.github/workflows/` | All automation workflows |
| `/apps/` | Where apps live |
| `/scripts/build-registry.js` | Generates app registry |

---

## Workflows Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `claude-build.yml` | Issue labeled "approved" | Claude builds the feature |
| `ci.yml` | PR to main | Runs `npm run build` |
| `auto-merge.yml` | PR opened by Claude | Enables auto-merge |
| `close-issue.yml` | PR merged by Claude | Closes linked issue |
| `pr-gatekeeper.yml` | Any PR opened | Closes unauthorized PRs |
| `fix-conflicts.yml` | Push to main | Fixes conflicts in Claude PRs |

---

## Commands

```bash
# Build registry
npm run build

# Check open PRs
gh pr list --repo felixweinberger/slopify

# Check open issues
gh issue list --repo felixweinberger/slopify

# View workflow runs
gh run list --repo felixweinberger/slopify
```

---

## Session Memory

Plan files from Claude sessions:
- `/Users/fweinberger/.claude/plans/sleepy-sleeping-mist.md` - Phase 4 detailed plan (auth, storage, in-app requests)

---

## Notes

- Auto-merge must be enabled in repo settings (Settings → General → Pull Requests → Allow auto-merge)
- `gh pr merge --auto` just queues the merge - actual merge happens when checks pass
- GitHub's "Closes #X" keyword is unreliable - we use explicit workflow to close issues
- Claude needs `--allowedTools Bash,Write,Edit,Read,MultiEdit` in `claude_args`
