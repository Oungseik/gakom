CREATE TABLE `attendance` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`attendance_policy_id` text NOT NULL,
	`checked_in_at` integer,
	`checked_out_at` integer,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`accuracy` real NOT NULL,
	CONSTRAINT `fk_attendance_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_attendance_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attendance_policy` (
	`id` text PRIMARY KEY,
	`enabled` integer DEFAULT 1 NOT NULL,
	`timezone` text NOT NULL,
	`clock_in_sec` integer NOT NULL,
	`clock_out_sec` integer NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_attendance_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attendance_user_id_idx` ON `attendance` (`user_id`);--> statement-breakpoint
CREATE INDEX `attendance_organization_id_idx` ON `attendance` (`attendance_policy_id`);--> statement-breakpoint
CREATE INDEX `attendance_policy_organization_id_idx` ON `attendance_policy` (`organization_id`);