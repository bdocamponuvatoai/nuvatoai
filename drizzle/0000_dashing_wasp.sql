CREATE TABLE `booking_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `booking_limits_expiry` ON `booking_limits` (`expires_at`);