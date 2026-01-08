ALTER TABLE `attendance` ADD `organization_id` text NOT NULL REFERENCES organization(id);--> statement-breakpoint
ALTER TABLE `attendance` ADD `date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `attendance` ADD `check_in_at` integer;--> statement-breakpoint
ALTER TABLE `attendance` ADD `check_out_at` integer;--> statement-breakpoint
ALTER TABLE `attendance` ADD `check_in_location` text;--> statement-breakpoint
ALTER TABLE `attendance` ADD `check_out_location` text;--> statement-breakpoint
ALTER TABLE `attendance` ADD `worked_seconds` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `attendance` ADD `status` text DEFAULT 'ABSENT' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`attendance_policy_id` text NOT NULL,
	`date` text NOT NULL,
	`check_in_at` integer,
	`check_out_at` integer,
	`check_in_location` text,
	`check_out_location` text,
	`worked_seconds` integer DEFAULT 0,
	`status` text DEFAULT 'ABSENT' NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_attendance_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_attendance_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_attendance_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`) ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `attendance_user_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `attendance_attendance_policy_id_idx`;--> statement-breakpoint
CREATE INDEX `attendance_user_date_idx` ON `attendance` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_org_date_idx` ON `attendance` (`organization_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_status_idx` ON `attendance` (`status`);
