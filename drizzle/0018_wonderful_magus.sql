ALTER TABLE `loan_applications` ADD `reference` varchar(64);--> statement-breakpoint
ALTER TABLE `loan_applications` ADD CONSTRAINT `loan_applications_reference_unique` UNIQUE(`reference`);