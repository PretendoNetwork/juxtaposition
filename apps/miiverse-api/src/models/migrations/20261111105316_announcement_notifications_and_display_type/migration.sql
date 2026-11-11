-- CreateEnum
CREATE TYPE "NotificationDisplayType" AS ENUM ('List', 'Popup', 'ListAndPopup');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'Changelog';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "display_type" "NotificationDisplayType" NOT NULL DEFAULT 'List';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "announcements_last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "announcement_notifications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notification_id" TEXT NOT NULL,

    CONSTRAINT "announcement_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcement_notifications_created_at_idx" ON "announcement_notifications"("created_at");

-- AddForeignKey
ALTER TABLE "announcement_notifications" ADD CONSTRAINT "announcement_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
