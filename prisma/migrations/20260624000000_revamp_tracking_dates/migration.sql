-- Drop legacy tracking dates
ALTER TABLE "applications" DROP COLUMN "deadline";
ALTER TABLE "applications" DROP COLUMN "followUpDate";

-- Add pipeline-event dates
ALTER TABLE "applications" ADD COLUMN "interviewDate" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN "offerDate"     TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN "rejectedDate"  TIMESTAMP(3);
