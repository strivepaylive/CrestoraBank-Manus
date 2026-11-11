CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(200),
	`subject` varchar(255) NOT NULL,
	`template` varchar(100) DEFAULT 'custom',
	`body` text,
	`emailStatus` enum('sent','failed') NOT NULL,
	`errorMessage` text,
	`resendId` varchar(100),
	`sentBy` varchar(100) DEFAULT 'admin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
