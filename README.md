# Slopify

Sloppy apps built by Claude.

## What is this?

Slopify is a collection of small apps, each built entirely by Claude through GitHub Actions. Submit an app idea as a GitHub issue, and Claude will implement it automatically.

## How it works

1. Someone opens a GitHub issue describing an app idea
2. A maintainer adds the "approved" label
3. GitHub Actions triggers Claude to implement the app
4. Claude creates a PR with the new app
5. CI runs to verify the build passes
6. PR auto-merges on success
7. Cloudflare Pages deploys to production

## Live site

https://slopify.felixweinberger.com

## Tech stack

- Vanilla HTML/CSS/JS (no frameworks)
- Cloudflare Pages for hosting
- GitHub Actions + Claude Code Action for automation

## Project structure

```
/
├── index.html          # Landing page
├── styles.css          # Global styles
├── apps/               # App directory
│   ├── registry.json   # Auto-generated app list
│   └── {app-name}/     # Individual apps
│       ├── index.html
│       └── manifest.json
└── scripts/
    └── build-registry.js
```

## Adding an app

Apps are added automatically by Claude, but each app needs:

- `apps/{name}/index.html` - The app itself
- `apps/{name}/manifest.json` - Metadata (name, description, icon)

See [CLAUDE.md](CLAUDE.md) for full guidelines.
