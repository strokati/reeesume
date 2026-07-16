-- AlterTable: track which encryption scheme each row uses.
-- Existing rows are V1 (no per-row salt). New writes / re-encryptions are V2.
-- The decrypt path reads this column to pick the right decoder.
ALTER TABLE "ai_provider_configs" ADD COLUMN "encryptionVersion" INTEGER NOT NULL DEFAULT 2;
