ALTER TABLE `invoices` ADD `feeAmount` decimal(14,2);--> statement-breakpoint
ALTER TABLE `invoices` ADD `remainingBalance` decimal(14,2);--> statement-breakpoint
ALTER TABLE `invoices` ADD `bottomCaption` varchar(300);