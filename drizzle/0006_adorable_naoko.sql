ALTER TABLE `transactions` ADD `currency` varchar(8) DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE `transactions` ADD `recipientCurrency` varchar(8);--> statement-breakpoint
ALTER TABLE `transactions` ADD `exchangeRate` decimal(18,8);--> statement-breakpoint
ALTER TABLE `transactions` ADD `transferFee` decimal(14,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `recipientAmount` decimal(14,2);--> statement-breakpoint
ALTER TABLE `transactions` ADD `rateTimestamp` timestamp;--> statement-breakpoint
ALTER TABLE `transactions` ADD `holdReason` varchar(500);--> statement-breakpoint
ALTER TABLE `transactions` ADD `reviewCaseId` varchar(64);--> statement-breakpoint
ALTER TABLE `transactions` ADD `estimatedReviewTime` varchar(100);--> statement-breakpoint
ALTER TABLE `transactions` ADD `balanceAfter` decimal(14,2);