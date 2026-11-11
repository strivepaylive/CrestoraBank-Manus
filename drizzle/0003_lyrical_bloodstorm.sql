CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`type` enum('transfer','deposit','withdrawal','funding') NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`description` varchar(500),
	`recipientName` varchar(200),
	`recipientAccount` varchar(64),
	`recipientBank` varchar(200),
	`transferType` enum('local','international'),
	`txStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `registrations` ADD `accountNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `registrations` ADD `balance` decimal(14,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_accountNumber_unique` UNIQUE(`accountNumber`);