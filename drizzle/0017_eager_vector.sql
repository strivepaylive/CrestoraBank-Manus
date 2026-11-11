CREATE TABLE `loan_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`employer` varchar(255),
	`workEmail` varchar(255),
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`purpose` varchar(255) NOT NULL,
	`termMonths` int NOT NULL,
	`interestRate` decimal(5,2) NOT NULL,
	`monthlyPayment` decimal(15,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`adminMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loan_applications_id` PRIMARY KEY(`id`)
);
