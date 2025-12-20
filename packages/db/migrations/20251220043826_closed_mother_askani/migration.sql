ALTER TABLE `user` ADD `country_code` text;--> statement-breakpoint
ALTER TABLE `organization` ADD `country_code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `team` ADD `timezone_country_code` text NOT NULL;--> statement-breakpoint
CREATE INDEX `user_country_code_idx` ON `user` (`country_code`);