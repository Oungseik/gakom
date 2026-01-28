ALTER TABLE `leave` ADD `status` text DEFAULT 'ENABLED' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leave` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`days` real NOT NULL,
	`status` text DEFAULT 'ENABLED' NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_leave`(`id`, `name`, `days`, `organization_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `days`, `organization_id`, `created_at`, `updated_at` FROM `leave`;--> statement-breakpoint
DROP TABLE `leave`;--> statement-breakpoint
ALTER TABLE `__new_leave` RENAME TO `leave`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
	CONSTRAINT `fk_leave_request_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_leave_request_leaveId_leave_id_fk` FOREIGN KEY (`leaveId`) REFERENCES `leave`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_request_reviewer_id_member_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_leave_request`(`id`, `member_id`, `leaveId`, `start_date`, `end_date`, `status`, `reason`, `reviewer_id`, `reviewed_at`, `created_at`, `updated_at`) SELECT `id`, `member_id`, `leaveId`, `start_date`, `end_date`, `status`, `reason`, `reviewer_id`, `reviewed_at`, `created_at`, `updated_at` FROM `leave_request`;--> statement-breakpoint
DROP TABLE `leave_request`;--> statement-breakpoint
ALTER TABLE `__new_leave_request` RENAME TO `leave_request`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_enabled` integer DEFAULT false,
	`image` text,
	`address` text,
	`city` text,
	`country_code` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`(`id`, `name`, `email`, `email_verified`, `two_factor_enabled`, `image`, `address`, `city`, `country_code`, `created_at`, `updated_at`) SELECT `id`, `name`, `email`, `email_verified`, `two_factor_enabled`, `image`, `address`, `city`, `country_code`, `created_at`, `updated_at` FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitation` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`position` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`expires_at` integer NOT NULL,
	`attendance_policy_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`inviter_id` text NOT NULL,
	`team_id` text,
	CONSTRAINT `fk_invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_invitation_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`),
	CONSTRAINT `fk_invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_invitation_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_invitation`(`id`, `organization_id`, `email`, `role`, `position`, `status`, `expires_at`, `attendance_policy_id`, `created_at`, `inviter_id`, `team_id`) SELECT `id`, `organization_id`, `email`, `role`, `position`, `status`, `expires_at`, `attendance_policy_id`, `created_at`, `inviter_id`, `team_id` FROM `invitation`;--> statement-breakpoint
DROP TABLE `invitation`;--> statement-breakpoint
ALTER TABLE `__new_invitation` RENAME TO `invitation`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_account`(`id`, `account_id`, `provider_id`, `user_id`, `access_token`, `refresh_token`, `id_token`, `access_token_expires_at`, `refresh_token_expires_at`, `scope`, `password`, `created_at`, `updated_at`) SELECT `id`, `account_id`, `provider_id`, `user_id`, `access_token`, `refresh_token`, `id_token`, `access_token_expires_at`, `refresh_token_expires_at`, `scope`, `password`, `created_at`, `updated_at` FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`active_organization_id` text,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_session`(`id`, `expires_at`, `token`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `user_id`, `active_organization_id`) SELECT `id`, `expires_at`, `token`, `created_at`, `updated_at`, `ip_address`, `user_agent`, `user_id`, `active_organization_id` FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_two_factor` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`secret` text,
	`backup_codes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_two_factor`(`id`, `user_id`, `secret`, `backup_codes`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `secret`, `backup_codes`, `created_at`, `updated_at` FROM `two_factor`;--> statement-breakpoint
DROP TABLE `two_factor`;--> statement-breakpoint
ALTER TABLE `__new_two_factor` RENAME TO `two_factor`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`member_id` text NOT NULL,
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
	CONSTRAINT `fk_attendance_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_attendance_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_attendance_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_attendance_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_attendance`(`id`, `user_id`, `member_id`, `organization_id`, `attendance_policy_id`, `date`, `check_in_at`, `check_out_at`, `check_in_location`, `check_out_location`, `worked_seconds`, `status`, `updated_at`) SELECT `id`, `user_id`, `member_id`, `organization_id`, `attendance_policy_id`, `date`, `check_in_at`, `check_out_at`, `check_in_location`, `check_out_location`, `worked_seconds`, `status`, `updated_at` FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance_policy` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`timezone` text NOT NULL,
	`clock_in_sec` integer NOT NULL,
	`clock_out_sec` integer NOT NULL,
	`work_days` text DEFAULT '["MON","TUE","WED","THU","FRI"]' NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_attendance_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_attendance_policy`(`id`, `name`, `timezone`, `clock_in_sec`, `clock_out_sec`, `work_days`, `organization_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `timezone`, `clock_in_sec`, `clock_out_sec`, `work_days`, `organization_id`, `created_at`, `updated_at` FROM `attendance_policy`;--> statement-breakpoint
DROP TABLE `attendance_policy`;--> statement-breakpoint
ALTER TABLE `__new_attendance_policy` RENAME TO `attendance_policy`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leave_balance` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`leave_id` text NOT NULL,
	`total_days` real NOT NULL,
	`used_days` real DEFAULT 0 NOT NULL,
	`pending_days` real DEFAULT 0 NOT NULL,
	`year` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_balance_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_leave_id_leave_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave`(`id`) ON DELETE CASCADE,
	CONSTRAINT `leave_balance_unique_idx` UNIQUE(`member_id`,`leave_id`,`year`)
);
--> statement-breakpoint
INSERT INTO `__new_leave_balance`(`id`, `member_id`, `leave_id`, `total_days`, `used_days`, `pending_days`, `year`, `created_at`, `updated_at`) SELECT `id`, `member_id`, `leave_id`, `total_days`, `used_days`, `pending_days`, `year`, `created_at`, `updated_at` FROM `leave_balance`;--> statement-breakpoint
DROP TABLE `leave_balance`;--> statement-breakpoint
ALTER TABLE `__new_leave_balance` RENAME TO `leave_balance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leave_balance_adjustment` (
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
	CONSTRAINT `fk_leave_balance_adjustment_balance_id_leave_balance_id_fk` FOREIGN KEY (`balance_id`) REFERENCES `leave_balance`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_leave_id_leave_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_adjusted_by_member_id_fk` FOREIGN KEY (`adjusted_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_leave_balance_adjustment_request_id_leave_request_id_fk` FOREIGN KEY (`request_id`) REFERENCES `leave_request`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_leave_balance_adjustment`(`id`, `balance_id`, `member_id`, `leave_id`, `adjustment_type`, `days`, `reason`, `adjusted_by`, `request_id`, `created_at`) SELECT `id`, `balance_id`, `member_id`, `leave_id`, `adjustment_type`, `days`, `reason`, `adjusted_by`, `request_id`, `created_at` FROM `leave_balance_adjustment`;--> statement-breakpoint
DROP TABLE `leave_balance_adjustment`;--> statement-breakpoint
ALTER TABLE `__new_leave_balance_adjustment` RENAME TO `leave_balance_adjustment`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_member` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`attendance_policy_id` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`position` text,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`left_at` integer,
	CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_member_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_member`(`id`, `organization_id`, `user_id`, `attendance_policy_id`, `role`, `position`, `status`, `created_at`, `left_at`) SELECT `id`, `organization_id`, `user_id`, `attendance_policy_id`, `role`, `position`, `status`, `created_at`, `left_at` FROM `member`;--> statement-breakpoint
DROP TABLE `member`;--> statement-breakpoint
ALTER TABLE `__new_member` RENAME TO `member`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`timezone_country_code` text,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_team`(`id`, `name`, `timezone_country_code`, `organization_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `timezone_country_code`, `organization_id`, `created_at`, `updated_at` FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team_memeber` (
	`id` text PRIMARY KEY,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_team_memeber_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_memeber_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_team_memeber`(`id`, `team_id`, `user_id`, `created_at`) SELECT `id`, `team_id`, `user_id`, `created_at` FROM `team_memeber`;--> statement-breakpoint
DROP TABLE `team_memeber`;--> statement-breakpoint
ALTER TABLE `__new_team_memeber` RENAME TO `team_memeber`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `invitation_organization_email_team_idx`;--> statement-breakpoint
CREATE INDEX `leave_policy_organization_id_idx` ON `leave` (`organization_id`);--> statement-breakpoint
CREATE INDEX `leave_request_member_id_idx` ON `leave_request` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_request_leave_id_idx` ON `leave_request` (`leaveId`);--> statement-breakpoint
CREATE INDEX `leave_request_status_idx` ON `leave_request` (`status`);--> statement-breakpoint
CREATE INDEX `leave_request_dates_idx` ON `leave_request` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `leave_request_reviewer_idx` ON `leave_request` (`reviewer_id`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_country_code_idx` ON `user` (`country_code`);--> statement-breakpoint
CREATE INDEX `invitation_organization_id_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `invitation_team_id_idx` ON `invitation` (`team_id`);--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `two_factor_user_id_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `two_factor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `attendance_user_date_idx` ON `attendance` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_member_date_idx` ON `attendance` (`member_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_org_date_idx` ON `attendance` (`organization_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_status_idx` ON `attendance` (`status`);--> statement-breakpoint
CREATE INDEX `attendance_policy_organization_id_idx` ON `attendance_policy` (`organization_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_member_leave_year_idx` ON `leave_balance` (`member_id`,`leave_id`,`year`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_balance_id_idx` ON `leave_balance_adjustment` (`balance_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_member_id_idx` ON `leave_balance_adjustment` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_leave_request_id_idx` ON `leave_balance_adjustment` (`request_id`);--> statement-breakpoint
CREATE INDEX `member_organization_id_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_user_id_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `member_attendance_policy_id_idx` ON `member` (`attendance_policy_id`);--> statement-breakpoint
CREATE INDEX `team_organization_id_idx` ON `team` (`organization_id`);--> statement-breakpoint
CREATE INDEX `team_member_team_id_idx` ON `team_memeber` (`team_id`);--> statement-breakpoint
CREATE INDEX `team_member_user_id_idx` ON `team_memeber` (`user_id`);