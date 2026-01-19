import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),              // GitHub user ID
  username: text('username').notNull(),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token'),         // GitHub OAuth token
  createdAt: integer('created_at', { mode: 'timestamp' }),
});
