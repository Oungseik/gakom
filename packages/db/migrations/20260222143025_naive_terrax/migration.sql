CREATE TABLE `invitation` (
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
CREATE TABLE `member` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`attendance_policy_id` text,
	`calendar_id` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`position` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`left_at` integer,
	CONSTRAINT `fk_member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_member_attendance_policy_id_attendance_policy_id_fk` FOREIGN KEY (`attendance_policy_id`) REFERENCES `attendance_policy`(`id`),
	CONSTRAINT `fk_member_calendar_id_calendar_id_fk` FOREIGN KEY (`calendar_id`) REFERENCES `calendar`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text NOT NULL,
	`country_code` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`timezone_country_code` text,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `team_member` (
	`id` text PRIMARY KEY,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
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
	CONSTRAINT `fk_leave_balance_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_leave_id_leave_policy_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave_policy`(`id`) ON DELETE CASCADE,
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
	CONSTRAINT `fk_leave_balance_adjustment_balance_id_leave_balance_id_fk` FOREIGN KEY (`balance_id`) REFERENCES `leave_balance`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_leave_id_leave_policy_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave_policy`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_balance_adjustment_adjusted_by_member_id_fk` FOREIGN KEY (`adjusted_by`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_leave_balance_adjustment_request_id_leave_request_id_fk` FOREIGN KEY (`request_id`) REFERENCES `leave_request`(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_policy` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`days` real NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `leave_request` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`leave_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reason` text,
	`reviewer_id` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_request_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`),
	CONSTRAINT `fk_leave_request_leave_id_leave_policy_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave_policy`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_request_reviewer_id_member_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `member`(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_member` (
	`leave_id` text NOT NULL,
	`member_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_member_leave_id_leave_policy_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave_policy`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_member_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `jwks` (
	`id` text PRIMARY KEY,
	`public_key` text NOT NULL,
	`private_key` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE TABLE `calendar` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`organization_id` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_calendar_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `calendar_event` (
	`id` text PRIMARY KEY,
	`calendar_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_calendar_event_calendar_id_calendar_id_fk` FOREIGN KEY (`calendar_id`) REFERENCES `calendar`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `attendance` (
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
CREATE TABLE `attendance_policy` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`timezone` text NOT NULL,
	`clock_in_sec` integer NOT NULL,
	`clock_out_sec` integer NOT NULL,
	`grace_period_sec` integer DEFAULT 0 NOT NULL,
	`work_days` text DEFAULT '["MON","TUE","WED","THU","FRI"]' NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_attendance_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account` (
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
CREATE TABLE `session` (
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
CREATE TABLE `two_factor` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`secret` text,
	`backup_codes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
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
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `image` (
	`object_path` text PRIMARY KEY,
	`filename` text NOT NULL,
	`uploader_id` text NOT NULL,
	`type` text DEFAULT 'image/webp' NOT NULL,
	`size` integer NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `invitation_organization_id_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `invitation_team_id_idx` ON `invitation` (`team_id`);--> statement-breakpoint
CREATE INDEX `member_organization_id_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_user_id_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `member_attendance_policy_id_idx` ON `member` (`attendance_policy_id`);--> statement-breakpoint
CREATE INDEX `member_calendar_id_idx` ON `member` (`calendar_id`);--> statement-breakpoint
CREATE INDEX `organization_slug_idx` ON `organization` (`slug`);--> statement-breakpoint
CREATE INDEX `team_organization_id_idx` ON `team` (`organization_id`);--> statement-breakpoint
CREATE INDEX `team_member_team_id_idx` ON `team_member` (`team_id`);--> statement-breakpoint
CREATE INDEX `team_member_user_id_idx` ON `team_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_member_leave_year_idx` ON `leave_balance` (`member_id`,`leave_id`,`year`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_balance_id_idx` ON `leave_balance_adjustment` (`balance_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_member_id_idx` ON `leave_balance_adjustment` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_balance_adjustment_leave_request_id_idx` ON `leave_balance_adjustment` (`request_id`);--> statement-breakpoint
CREATE INDEX `leave_policy_organization_id_idx` ON `leave_policy` (`organization_id`);--> statement-breakpoint
CREATE INDEX `leave_request_member_id_idx` ON `leave_request` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_request_leave_id_idx` ON `leave_request` (`leave_id`);--> statement-breakpoint
CREATE INDEX `leave_request_status_idx` ON `leave_request` (`status`);--> statement-breakpoint
CREATE INDEX `leave_request_dates_idx` ON `leave_request` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `leave_request_reviewer_idx` ON `leave_request` (`reviewer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_id_leave_id_idx` ON `leave_member` (`member_id`,`leave_id`);--> statement-breakpoint
CREATE INDEX `calendar_organization_id_idx` ON `calendar` (`organization_id`);--> statement-breakpoint
CREATE INDEX `calendar_is_default_idx` ON `calendar` (`is_default`);--> statement-breakpoint
CREATE INDEX `calendar_event_calendar_id_idx` ON `calendar_event` (`calendar_id`);--> statement-breakpoint
CREATE INDEX `calendar_event_date_idx` ON `calendar_event` (`date`);--> statement-breakpoint
CREATE INDEX `calendar_event_calendar_date_idx` ON `calendar_event` (`calendar_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_user_date_idx` ON `attendance` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_member_date_idx` ON `attendance` (`member_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_org_date_idx` ON `attendance` (`organization_id`,`date`);--> statement-breakpoint
CREATE INDEX `attendance_status_idx` ON `attendance` (`status`);--> statement-breakpoint
CREATE INDEX `attendance_policy_organization_id_idx` ON `attendance_policy` (`organization_id`);--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `two_factor_user_id_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `two_factor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_country_code_idx` ON `user` (`country_code`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `image_uploader_id_idx` ON `image` (`uploader_id`);