ALTER TABLE `transactions` MODIFY COLUMN `txStatus` enum('processing','pending_vat','pending_imf','pending','approved','completed','failed','on-hold','reversed') DEFAULT 'processing';--> statement-breakpoint
ALTER TABLE `registrations` ADD `vatCode` varchar(20);--> statement-breakpoint
ALTER TABLE `registrations` ADD `imfCode` varchar(20);--> statement-breakpoint
ALTER TABLE `registrations` ADD `requireVatCode` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `registrations` ADD `requireImfCode` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `transactions` ADD `vatCodeAttempts` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `transactions` ADD `imfCodeAttempts` int DEFAULT 0;