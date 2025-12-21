ALTER TABLE `attendance_policy` ADD `name` text;--> statement-breakpoint
ALTER TABLE `attendance_policy` ADD `work_days` text DEFAULT '["MON","TUE","WED","THUS","FRI"]';