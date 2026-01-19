# Slopify Implementation Plan

**Domain:** slopify.felixweinberger.com

## Architecture

```
User opens GitHub Issue
        ↓
Felix adds "approved" label
        ↓
GitHub Actions triggers claude-code-action
        ↓
Claude implements feature, creates PR
        ↓
CI runs (lint, build, preview deploy)
        ↓
Auto-merge on CI success
        ↓
Cloudflare Pages deploys to production
```

## Repo Structure

```
slopify/
├── .github/
│   └── workflows/
│       ├── claude-build.yml    # Triggered by "approved" label
│       └── ci.yml              # Lint, build, preview
├── CLAUDE.md                   # Project context for Claude
├── apps/
│   ├── registry.json           # Auto-generated app list
│   └── calculator/
│       ├── index.html
│       └── manifest.json
├── index.html                  # Landing page
├── styles.css                  # Global styles
├── scripts/
│   └── build-registry.js       # Scans /apps, generates registry.json
├── wrangler.toml               # Cloudflare config (for future D1)
└── package.json
```

## DNS Setup (felixweinberger.com)

Add a CNAME record:
- **Name:** `slopify`
- **Target:** `<your-project>.pages.dev` (Cloudflare will provide this)
- **Proxy:** Yes (orange cloud)

Or if using Cloudflare for the domain already, Pages will auto-configure it.

---

## Phase 1: Repo + Deployment

### Tasks
1. [x] Create plan.md
2. [ ] Initialize repo with basic structure
3. [ ] Create landing page (index.html)
4. [ ] Create example app (calculator)
5. [ ] Create build script for registry.json
6. [ ] Set up package.json with build script
7. [ ] Initialize git repo
8. [ ] Create GitHub repo and push
9. [ ] Connect to Cloudflare Pages
10. [ ] Configure custom domain

### Deliverable
Push to main → auto-deploys to slopify.felixweinberger.com

---

## Phase 2: Claude Integration

### Tasks
1. [ ] Run `/install-github-app` in Claude Code terminal
2. [ ] Create `.github/workflows/claude-build.yml`
3. [ ] Create `.github/workflows/ci.yml` (lint + build)
4. [ ] Write comprehensive `CLAUDE.md`
5. [ ] Add `ANTHROPIC_API_KEY` to repo secrets
6. [ ] Configure branch protection (require CI status checks) + auto-merge

### Deliverable
Add "approved" label to issue → Claude creates PR → auto-merges → deploys

---

## Phase 3: Test & Iterate

### Tasks
1. [ ] Create test issue: "Build a pomodoro timer"
2. [ ] Add "approved" label
3. [ ] Verify Claude creates valid PR
4. [ ] Verify CI passes
5. [ ] Verify auto-merge works
6. [ ] Verify Cloudflare deploys
7. [ ] Iterate on CLAUDE.md based on results

---

## Phase 4: Public Submission (Future)

### Options
- **Simple:** Link to GitHub issue template on landing page
- **Fancy:** Chat bubble that creates issues via GitHub API (requires OAuth or bot token)

### Tasks (deferred)
- [ ] Decide on submission method
- [ ] Implement chat/form UI
- [ ] Set up rate limiting
- [ ] Add request validation

---

## Key Files to Create

### CLAUDE.md (Project Context)

Will include:
- Project purpose and structure
- How to create new apps (folder structure, manifest.json)
- Code style guidelines
- What tools/patterns to use
- What NOT to do (no external dependencies, etc.)

### claude-build.yml (Workflow)

```yaml
name: Claude Build Feature

on:
  issues:
    types: [labeled]

jobs:
  build:
    if: github.event.label.name == 'approved'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            Implement the feature requested in this issue.
            Follow CLAUDE.md guidelines.
            Create a PR when done.

            ISSUE #${{ github.event.issue.number }}
            TITLE: ${{ github.event.issue.title }}

            ${{ github.event.issue.body }}

      # Auto-merge is enabled, but PR only merges after CI passes
      # Requires branch protection with required status checks
      - name: Enable auto-merge
        run: gh pr merge --auto --squash
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Notes

- **No backend for v1:** Apps are frontend-only (localStorage for persistence)
- **D1 ready:** Structure supports adding Cloudflare D1 later
- **Security:** Manual "approved" label is the gate; CI provides additional checks
- **Cost:** GitHub Actions free tier (2000 mins/month), Anthropic API pay-per-use
