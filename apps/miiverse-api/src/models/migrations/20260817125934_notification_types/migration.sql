-- AlterTable
ALTER TABLE "user_settings"
ADD COLUMN     "notify_empathy" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN     "notify_follows" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN     "notify_reply" BOOLEAN NOT NULL DEFAULT FALSE;

-- Don't leave leftover constraints
ALTER TABLE "user_settings"
ALTER COLUMN   "notify_empathy" DROP DEFAULT,
ALTER COLUMN   "notify_follows" DROP DEFAULT,
ALTER COLUMN   "notify_reply" DROP DEFAULT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "NotificationType" ADD VALUE 'Empathy';
ALTER TYPE "NotificationType" ADD VALUE 'Reply';
