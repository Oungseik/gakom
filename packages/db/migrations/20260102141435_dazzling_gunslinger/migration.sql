CREATE TABLE `leave_balance` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`leave_id` text NOT NULL,
	`total_days` real NOT NULL,
	`used_days` real DEFAULT 0 NOT NULL,
	`pending_days` real DEFAULT 0 NOT NULL,
	`year` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_balance_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_balance_leave_id_leave_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave`(`id`) ON DELETE cascade,
	CONSTRAINT `leave_balance_unique_idx` UNIQUE(`member_id`,`leave_id`,`year`)
);
--> statement-breakpoint
CREATE TABLE `leave_balance_adjustment` (
	`id` text PRIMARY KEY,
	`balance_id` text NOT NULL,
	`member_id` text NOT NULL,
	`leave_id` text NOT NULL,
	`adjustment_type` text NOT NULL,
	`days` real NOT NULL,
	`reason` text,
	`adjusted_by` text,
	`request_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_balance_adjustment_balance_id_leave_balance_id_fk` FOREIGN KEY (`balance_id`) REFERENCES `leave_balance`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_balance_adjustment_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_balance_adjustment_leave_id_leave_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_balance_adjustment_adjusted_by_member_id_fk` FOREIGN KEY (`adjusted_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_leave_balance_adjustment_request_id_leave_request_id_fk` FOREIGN KEY (`request_id`) REFERENCES `leave_request`(`id`)
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leave` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`days` real NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_type_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_leave`(`id`, `name`, `days`, `organization_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `days`, `organization_id`, `created_at`, `updated_at` FROM `leave`;--> statement-breakpoint
DROP TABLE `leave`;--> statement-breakpoint
ALTER TABLE `__new_leave` RENAME TO `leave`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `leave_policy_organization_id_idx` ON `leave` (`organization_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_member_leave_year_idx` ON `leave_balance` (`member_id`,`leave_id`,`year`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_balance_id_idx` ON `leave_balance_adjustment` (`balance_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_member_id_idx` ON `leave_balance_adjustment` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_leave_request_id_idx` ON `leave_balance_adjustment` (`request_id`);