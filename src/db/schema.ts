import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),              // GitHub user ID
  username: text('username').notNull(),
  avatarUrl: text('avatar_url'),
  accessToken: text('access_token'),         // GitHub OAuth token
  displayName: text('display_name'),         // Optional display name
  isPublic: integer('is_public').default(1), // 1 = visible in user list (public by default)
  createdAt: integer('created_at', { mode: 'timestamp' }),
});

export const appData = sqliteTable('app_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  appId: text('app_id').notNull(),           // e.g., "counter", "calculator"
  key: text('key').notNull(),                // e.g., "count", "history"
  value: text('value').notNull(),            // JSON string
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_app_data_user').on(table.userId),
  index('idx_app_data_app').on(table.appId),
]);

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fromUserId: text('from_user_id').notNull().references(() => users.id),
  toUserId: text('to_user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [
  index('idx_messages_from').on(table.fromUserId),
  index('idx_messages_to').on(table.toUserId),
  index('idx_messages_conversation').on(table.fromUserId, table.toUserId),
]);
