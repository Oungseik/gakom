PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_member` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`attendance_policy_id` text,
	`role` text DEFAULT 'member' NOT NULL,
	`position` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`left_at` integer,
	CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_member_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_member`(`id`, `organization_id`, `user_id`, `attendance_policy_id`, `role`, `position`, `created_at`, `left_at`) SELECT `id`, `organization_id`, `user_id`, `attendance_policy_id`, `role`, `position`, `created_at`, `left_at` FROM `member`;--> statement-breakpoint
DROP TABLE `member`;--> statement-breakpoint
ALTER TABLE `__new_member` RENAME TO `member`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `member_organization_id_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_user_id_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `member_attendance_policy_id_idx` ON `member` (`attendance_policy_id`);--> statement-breakpoint
ALTER TABLE `attendance_policy` DROP COLUMN `enabled`;