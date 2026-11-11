CREATE TABLE `kyc_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`documentType` enum('id_card','passport','drivers_license','utility_bill') NOT NULL,
	`documentUrl` varchar(500) NOT NULL,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
