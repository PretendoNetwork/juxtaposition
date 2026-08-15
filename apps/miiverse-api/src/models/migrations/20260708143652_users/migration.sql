-- CreateEnum
CREATE TYPE "ProfilePrivacyType" AS ENUM ('Public', 'UsersOnly');

-- CreateTable
CREATE TABLE "users" (
    "pid" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "display_name" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "account_status" INTEGER NOT NULL,
    "ban_reason" TEXT,
    "ban_ends_at" TIMESTAMP(3),
    "banned_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "pid" INTEGER NOT NULL,
    "receive_notifications" BOOLEAN NOT NULL,
    "profile_privacy" "ProfilePrivacyType" NOT NULL,
    "is_favourite_community_visible" BOOLEAN NOT NULL,
    "is_country_visible" BOOLEAN NOT NULL,
    "is_relationship_visible" BOOLEAN NOT NULL,
    "is_birthday_visible" BOOLEAN NOT NULL,
    "is_game_skill_visible" BOOLEAN NOT NULL,
    "profile_comment" TEXT,
    "game_skill" INTEGER NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "pid" INTEGER NOT NULL,
    "following_pid" INTEGER NOT NULL,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("pid", "following_pid")
);

-- CreateTable
CREATE TABLE "community_follows" (
    "pid" INTEGER NOT NULL,
    "community_id" TEXT NOT NULL,

    CONSTRAINT "community_follows_pkey" PRIMARY KEY ("pid", "community_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_pid_key" ON "user_settings"("pid");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_pid_fkey" FOREIGN KEY ("pid") REFERENCES "users"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_pid_fkey" FOREIGN KEY ("pid") REFERENCES "users"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_pid_fkey" FOREIGN KEY ("following_pid") REFERENCES "users"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_follows" ADD CONSTRAINT "community_follows_pid_fkey" FOREIGN KEY ("pid") REFERENCES "users"("pid") ON DELETE CASCADE ON UPDATE CASCADE;
