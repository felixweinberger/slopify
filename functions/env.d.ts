// Custom env vars not in wrangler.toml
interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_BOT_TOKEN: string;  // Fine-grained PAT scoped to slopify repo (issues:write)
}
