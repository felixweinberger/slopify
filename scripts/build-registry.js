const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const registryPath = path.join(appsDir, 'registry.json');

// Find all app directories with manifest.json
const apps = [];

if (fs.existsSync(appsDir)) {
  const entries = fs.readdirSync(appsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const manifestPath = path.join(appsDir, entry.name, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        apps.push({
          id: entry.name,
          name: manifest.name || entry.name,
          description: manifest.description || '',
          icon: manifest.icon || null,
          path: `/apps/${entry.name}/`
        });
        console.log(`  Found: ${manifest.name || entry.name}`);
      } catch (err) {
        console.error(`  Error reading ${manifestPath}: ${err.message}`);
      }
    }
  }
}

// Write registry
fs.writeFileSync(registryPath, JSON.stringify(apps, null, 2));

console.log(`\nBuilt registry with ${apps.length} app(s)`);
