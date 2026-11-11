CREATE TABLE `cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`cardType` enum('debit','credit') NOT NULL,
	`cardStatus` enum('pending','approved','rejected','active','frozen') DEFAULT 'pending',
	`cardNumber` varchar(20),
	`expiryDate` varchar(5),
	`cvv` varchar(4),
	`cardholderName` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `registrations` ADD `kycStatus` enum('not_submitted','pending','approved','rejected') DEFAULT 'not_submitted';--> statement-breakpoint
ALTER TABLE `registrations` ADD `idDocumentUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `registrations` ADD `proofOfAddressUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `registrations` ADD `selfieUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `registrations` ADD `transferPin` varchar(255);--> statement-breakpoint
ALTER TABLE `registrations` ADD `twoFactorEnabled` boolean DEFAULT false;