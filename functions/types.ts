import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  accessToken: string | null;
  createdAt: number | null;
}
