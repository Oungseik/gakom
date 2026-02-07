CREATE TABLE `leave_member` (
	`leave_id` text NOT NULL,
	`member_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_leave_member_leave_id_leave_id_fk` FOREIGN KEY (`leave_id`) REFERENCES `leave`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_leave_member_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `member_id_leave_id_idx` ON `leave_member` (`member_id`,`leave_id`);