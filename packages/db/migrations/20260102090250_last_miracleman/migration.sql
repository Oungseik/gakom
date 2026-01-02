ALTER TABLE `leave_type` RENAME TO `leave`;--> statement-breakpoint
ALTER TABLE `leave` RENAME COLUMN `default_days` TO `days`;--> statement-breakpoint
ALTER TABLE `leave_request` RENAME COLUMN `leave_type_id` TO `leaveId`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leave_request` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`leaveId` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reason` text,
	`reviewer_id` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_request_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE no action,
	CONSTRAINT `fk_leave_request_leave_type_id_leave_type_id_fk` FOREIGN KEY (`leaveId`) REFERENCES `leave`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_request_reviewer_id_member_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_leave_request`(`id`, `member_id`, `leaveId`, `start_date`, `end_date`, `status`, `reason`, `reviewer_id`, `reviewed_at`, `created_at`, `updated_at`) SELECT `id`, `member_id`, `leaveId`, `start_date`, `end_date`, `status`, `reason`, `reviewer_id`, `reviewed_at`, `created_at`, `updated_at` FROM `leave_request`;--> statement-breakpoint
DROP TABLE `leave_request`;--> statement-breakpoint
ALTER TABLE `__new_leave_request` RENAME TO `leave_request`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
DROP INDEX IF EXISTS `leave_type_organization_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `leave_request_policy_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `leave_request_type_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `leave_policy_organization_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `member_leave_policy_id_idx`;--> statement-breakpoint
CREATE INDEX `leave_request_member_id_idx` ON `leave_request` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_request_leave_id_idx` ON `leave_request` (`leaveId`);--> statement-breakpoint
CREATE INDEX `leave_request_status_idx` ON `leave_request` (`status`);--> statement-breakpoint
CREATE INDEX `leave_request_dates_idx` ON `leave_request` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `leave_request_reviewer_idx` ON `leave_request` (`reviewer_id`);--> statement-breakpoint
CREATE INDEX `member_organization_id_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_user_id_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `member_attendance_policy_id_idx` ON `member` (`attendance_policy_id`);--> statement-breakpoint
CREATE INDEX `leave_policy_organization_id_idx` ON `leave` (`organization_id`);--> statement-breakpoint
DROP TABLE `leave_policy`;