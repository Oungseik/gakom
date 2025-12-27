ALTER TABLE `member` ADD `attendance_policy_id` text NOT NULL REFERENCES attendance_policy(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance_policy` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`timezone` text NOT NULL,
	`clock_in_sec` integer NOT NULL,
	`clock_out_sec` integer NOT NULL,
	`work_days` text DEFAULT '["MON","TUE","WED","THU","FRI"]' NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_attendance_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_attendance_policy`(`id`, `name`, `enabled`, `timezone`, `clock_in_sec`, `clock_out_sec`, `work_days`, `organization_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `enabled`, `timezone`, `clock_in_sec`, `clock_out_sec`, `work_days`, `organization_id`, `created_at`, `updated_at` FROM `attendance_policy`;--> statement-breakpoint
DROP TABLE `attendance_policy`;--> statement-breakpoint
ALTER TABLE `__new_attendance_policy` RENAME TO `attendance_policy`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `attendance_policy_organization_id_idx` ON `attendance_policy` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_attendance_policy_id_idx` ON `member` (`attendance_policy_id`);