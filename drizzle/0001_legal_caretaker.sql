CREATE TABLE `adminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`signupLink` varchar(500),
	`enableNotifications` boolean DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`adminId` int,
	`message` text NOT NULL,
	`senderType` enum('user','admin') NOT NULL,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`type` enum('user_registered','approval_requested','user_approved','user_rejected') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedUserId` int,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otpVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`registrationId` int NOT NULL,
	`code` varchar(10) NOT NULL,
	`channel` enum('email','sms') NOT NULL,
	`isVerified` boolean DEFAULT false,
	`attempts` int DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `otpVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100),
	`middleName` varchar(100),
	`lastName` varchar(100),
	`username` varchar(100),
	`contactMethod` enum('email','phone'),
	`email` varchar(320),
	`phone` varchar(20),
	`password` text,
	`status` enum('pending','verified','approved','rejected') DEFAULT 'pending',
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `registrations_username_unique` UNIQUE(`username`)
);
