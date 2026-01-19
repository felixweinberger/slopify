CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`avatar_url` text,
	`access_token` text,
	`created_at` integer
);
