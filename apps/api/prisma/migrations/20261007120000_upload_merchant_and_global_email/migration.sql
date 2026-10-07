-- Email becomes unique across all merchants, because login identifies an account by email alone.
-- The new index is created first: if two accounts share an email, the migration stops here
-- with nothing changed. Resolve the duplicates, then run it again.
CREATE UNIQUE INDEX `unique_user_email` ON `users`(`email`);

-- DropIndex
DROP INDEX `unique_merchant_email` ON `users`;

-- Uploads become tenant-owned. The column is added nullable, filled from the uploader's
-- merchant, and only then made required.
ALTER TABLE `uploads` ADD COLUMN `merchant_id` CHAR(36) NULL;

UPDATE `uploads` u
JOIN `users` us ON us.`id` = u.`uploaded_by_id`
SET u.`merchant_id` = us.`merchant_id`;

-- Fails if an upload's uploader no longer exists: no merchant can be derived for it.
-- Set `merchant_id` on those rows by hand (or delete them), then make the column required.
ALTER TABLE `uploads` MODIFY `merchant_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_uploads_merchant` ON `uploads`(`merchant_id`);

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_ibfk_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
