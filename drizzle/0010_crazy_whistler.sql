CREATE TABLE `deposit_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`depositMethod` enum('debit_card','credit_card','bank_transfer','crypto','skrill') NOT NULL,
	`cryptoAsset` varchar(30),
	`amount` decimal(14,2) NOT NULL,
	`currency` varchar(8) DEFAULT 'USD',
	`reference` varchar(64),
	`proofUrl` varchar(500),
	`proofFileName` varchar(255),
	`depositStatus` enum('awaiting_payment','pending_review','info_requested','approved','rejected') DEFAULT 'awaiting_payment',
	`adminNote` text,
	`transactionId` int,
	`stripeSessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposit_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `deposit_requests_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
ALTER TABLE `cards` ADD `issuanceFee` decimal(14,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `cards` ADD `feeReference` varchar(64);