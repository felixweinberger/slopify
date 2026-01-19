# Slopify - Project Guide for Claude

## What is Slopify?

Slopify is a collection of small, single-purpose web apps built by Claude based on GitHub issue requests. The philosophy: functional tools without overthinking. Sometimes beautiful, sometimes sloppy.

## Repo Structure

```
slopify/
├── index.html              # Landing page (lists all apps)
├── styles.css              # Global styles (can be imported by apps)
├── apps/
│   ├── registry.json       # Auto-generated list of apps
│   └── {app-name}/         # Each app is a folder
│       ├── index.html      # App entry point
│       └── manifest.json   # App metadata
├── scripts/
│   └── build-registry.js   # Scans apps and builds registry.json
└── .github/workflows/      # CI and Claude build workflows
```

## How to Create a New App

1. Create a folder in `/apps/{app-name}/` (use kebab-case)
2. Create `index.html` as the entry point
3. Create `manifest.json` with app metadata
4. The build script will auto-register the app

### manifest.json Format

```json
{
  "name": "My App Name",
  "description": "A brief description of what the app does",
  "icon": "🎯"
}
```

### App HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Name - Slopify</title>
  <link rel="stylesheet" href="../../styles.css">
  <style>
    /* App-specific styles */
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="/">← Back to Slopify</a>
      <h1>App Name</h1>
    </header>
    <main>
      <!-- App content -->
    </main>
  </div>
  <script>
    // App logic
  </script>
</body>
</html>
```

## Code Requirements

### DO:
- Use vanilla HTML, CSS, and JavaScript
- Keep apps self-contained in their folder
- Use localStorage for persistence if needed
- Import global styles.css for consistent theming
- Make apps responsive and mobile-friendly
- Include a back link to the main Slopify page

### DON'T:
- Use npm packages or external dependencies
- Use frameworks (React, Vue, etc.)
- Require a backend or server
- Make external API calls (unless the app specifically needs them)
- Modify files outside the app's folder (except manifest.json)

## Testing Your App

Before committing:
1. Open the app's index.html in a browser
2. Verify all functionality works
3. Check responsive design (mobile + desktop)
4. Run `npm run build` to update registry.json

## Style Guide

- Use the color variables from styles.css (--purple, --pink, --yellow, --cyan)
- Keep the playful, colorful aesthetic
- Use system fonts (already set in styles.css)
- Maintain the dark theme with gradient background

## PR Guidelines

When creating a PR:
- Use a clear title describing the app
- Include `Closes #N` in the PR body (where N is the issue number)
- Include a brief description of the app's functionality
- The PR will auto-merge after CI passes

**After creating the PR, close the linked issue:**
```bash
gh issue close <issue_number> --comment "🚀 PR #<pr_number> created! It will auto-merge after CI passes."
```

## Important: package-lock.json

If regenerating package-lock.json, ensure it uses the public npm registry:

```bash
npm install --registry https://registry.npmjs.org
```

The resolved URLs must point to `registry.npmjs.org`, NOT any private/internal registries. Cloudflare Pages builds will fail if the lockfile references private registries.
