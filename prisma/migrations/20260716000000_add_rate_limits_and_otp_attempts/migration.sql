-- AlterTable: track failed verify attempts per OTP code
ALTER TABLE "otp_codes" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: rate-limit buckets for OTP issue / verify / future use
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_key_key" ON "rate_limits"("key");
CREATE INDEX "rate_limits_expiresAt_idx" ON "rate_limits"("expiresAt");
