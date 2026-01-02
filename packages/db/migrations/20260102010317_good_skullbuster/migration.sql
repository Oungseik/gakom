CREATE TABLE `leave_policy` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`leave_types` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_policy_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `leave_request` (
	`id` text PRIMARY KEY,
	`member_id` text NOT NULL,
	`leave_policy_id` text NOT NULL,
	`leave_type_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`total_days` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reason` text,
	`reviewer_id` text,
	`reviewed_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_request_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_request_leave_policy_id_leave_policy_id_fk` FOREIGN KEY (`leave_policy_id`) REFERENCES `leave_policy`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_request_leave_type_id_leave_type_id_fk` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_leave_request_reviewer_id_user_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE TABLE `leave_type` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`default_days` integer NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_type_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `member` ADD `leave_policy_id` text REFERENCES leave_policy(id);--> statement-breakpoint
CREATE INDEX `leave_policy_organization_id_idx` ON `leave_policy` (`organization_id`);--> statement-breakpoint
CREATE INDEX `leave_request_member_id_idx` ON `leave_request` (`member_id`);--> statement-breakpoint
CREATE INDEX `leave_request_policy_id_idx` ON `leave_request` (`leave_policy_id`);--> statement-breakpoint
CREATE INDEX `leave_request_type_id_idx` ON `leave_request` (`leave_type_id`);--> statement-breakpoint
CREATE INDEX `leave_request_status_idx` ON `leave_request` (`status`);--> statement-breakpoint
CREATE INDEX `leave_request_dates_idx` ON `leave_request` (`start_date`,`end_date`);--> statement-breakpoint
CREATE INDEX `leave_type_organization_id_idx` ON `leave_type` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_leave_policy_id_idx` ON `member` (`leave_policy_id`);