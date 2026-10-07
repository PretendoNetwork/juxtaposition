-- CreateEnum
CREATE TYPE "AutomodActionType" AS ENUM ('Blocked', 'Logged');

-- CreateEnum
CREATE TYPE "AutomodRuleType" AS ENUM ('Keyword');

-- CreateEnum
CREATE TYPE "AutomodRuleMode" AS ENUM ('Block', 'Log');

-- CreateEnum
CREATE TYPE "ServerAccessLevel" AS ENUM ('Prod', 'Beta', 'Dev');

-- CreateTable
CREATE TABLE "automod_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rule_id" TEXT NOT NULL,
    "author" INTEGER NOT NULL,
    "action" "AutomodActionType" NOT NULL,
    "post_content_body" TEXT,
    "matches" JSONB,
    "post_id" TEXT,
    "parent_post_id" TEXT,
    "community_id" TEXT,

    CONSTRAINT "automod_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automod_rules" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "type" "AutomodRuleType" NOT NULL,
    "mode" "AutomodRuleMode" NOT NULL,

    CONSTRAINT "automod_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automod_rule_keyword_settings" (
    "rule_id" TEXT NOT NULL,
    "keywords" TEXT[],

    CONSTRAINT "automod_rule_keyword_settings_pkey" PRIMARY KEY ("rule_id")
);

-- CreateTable
CREATE TABLE "discovery_endpoints" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "server_access_level" "ServerAccessLevel" NOT NULL,
    "status" INTEGER NOT NULL,
    "api_host" TEXT NOT NULL,
    "wup_host" TEXT NOT NULL,
    "ctr_host" TEXT NOT NULL,

    CONSTRAINT "discovery_endpoints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "automod_rule_keyword_settings" ADD CONSTRAINT "automod_rule_keyword_settings_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automod_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
