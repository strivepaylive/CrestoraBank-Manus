ALTER TABLE `invoices` ADD `senderName` varchar(200);--> statement-breakpoint
ALTER TABLE `invoices` ADD `invoiceType` varchar(50) DEFAULT 'due';--> statement-breakpoint
ALTER TABLE `registrations` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;