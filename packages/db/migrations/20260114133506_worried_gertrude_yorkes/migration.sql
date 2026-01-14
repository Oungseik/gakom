ALTER TABLE `attendance` ADD `member_id` text NOT NULL REFERENCES member(id);--> statement-breakpoint
CREATE INDEX `attendance_member_date_idx` ON `attendance` (`member_id`,`date`);