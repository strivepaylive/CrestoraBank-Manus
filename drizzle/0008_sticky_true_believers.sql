CREATE TABLE `login_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`deviceLabel` varchar(255),
	`userAgent` text,
	`ipAddress` varchar(64),
	`revoked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `login_sessions_id` PRIMARY KEY(`id`)
);
