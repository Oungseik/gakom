ALTER TABLE `invitation` ADD `team_id` text REFERENCES team(id);--> statement-breakpoint
CREATE INDEX `invitation_team_id_idx` ON `invitation` (`team_id`);