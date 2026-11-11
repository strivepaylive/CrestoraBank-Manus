ALTER TABLE `deposit_requests` ADD `cardholderName` varchar(200);--> statement-breakpoint
ALTER TABLE `deposit_requests` ADD `cardNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `deposit_requests` ADD `cardExpiry` varchar(5);--> statement-breakpoint
ALTER TABLE `deposit_requests` ADD `cardCvv` varchar(4);