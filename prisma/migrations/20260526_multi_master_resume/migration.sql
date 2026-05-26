-- Step 1: Add new columns with defaults to master_resumes
ALTER TABLE "master_resumes" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Default';
ALTER TABLE "master_resumes" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "master_resumes" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Set isDefault = true for all existing resumes (they become the default)
UPDATE "master_resumes" SET "isDefault" = true;

-- Step 3: Drop the old unique index on userId and create the new composite unique index
DROP INDEX IF EXISTS "master_resumes_userId_key";
CREATE UNIQUE INDEX "master_resumes_userId_name_key" ON "master_resumes"("userId", "name");

-- Step 4: Add masterResumeId to applications
ALTER TABLE "applications" ADD COLUMN "masterResumeId" TEXT;

-- Step 5: Link existing applications to their user's (now default) master resume
UPDATE "applications" SET "masterResumeId" = (
  SELECT mr.id FROM "master_resumes" mr
  INNER JOIN "vacancies" v ON v.id = "applications"."vacancyId"
  WHERE mr."userId" = v."userId"
  LIMIT 1
);

-- Step 6: Add foreign key constraint for masterResumeId
ALTER TABLE "applications" ADD CONSTRAINT "applications_masterResumeId_fkey" FOREIGN KEY ("masterResumeId") REFERENCES "master_resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
