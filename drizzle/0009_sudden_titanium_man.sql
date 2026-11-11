ALTER TABLE `login_sessions` ADD `sessionKey` varchar(64);--> statement-breakpoint
ALTER TABLE `login_sessions` ADD CONSTRAINT `login_sessions_sessionKey_unique` UNIQUE(`sessionKey`);