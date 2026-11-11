CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`type` enum('transfer','deposit','withdrawal','security','support','system') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `txStatus` enum('pending','approved','completed','failed','on-hold','reversed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `transactions` ADD `reference` varchar(64);--> statement-breakpoint
ALTER TABLE `transactions` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_reference_unique` UNIQUE(`reference`);