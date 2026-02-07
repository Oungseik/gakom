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
ALTER TABLE `member` ADD `calendar_id` text REFERENCES calendar(id);--> statement-breakpoint
CREATE INDEX `calendar_organization_id_idx` ON `calendar` (`organization_id`);--> statement-breakpoint
CREATE INDEX `calendar_is_default_idx` ON `calendar` (`is_default`);--> statement-breakpoint
CREATE INDEX `calendar_event_calendar_id_idx` ON `calendar_event` (`calendar_id`);--> statement-breakpoint
CREATE INDEX `calendar_event_date_idx` ON `calendar_event` (`date`);--> statement-breakpoint
CREATE INDEX `calendar_event_calendar_date_idx` ON `calendar_event` (`calendar_id`,`date`);--> statement-breakpoint
CREATE INDEX `member_calendar_id_idx` ON `member` (`calendar_id`);--> statement-breakpoint
ALTER TABLE `leave` DROP COLUMN `status`;