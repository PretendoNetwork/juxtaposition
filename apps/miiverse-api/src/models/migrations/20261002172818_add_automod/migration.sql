-- CreateEnum
CREATE TYPE "AutomodActionType" AS ENUM ('Blocked', 'Logged');

-- CreateEnum
CREATE TYPE "AutomodRuleType" AS ENUM ('Keyword');

-- CreateEnum
CREATE TYPE "AutomodRuleMode" AS ENUM ('Block', 'Log');

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
    "type" "AutomodRuleType" NOT NULL,
    "mode" "AutomodRuleMode" NOT NULL,
    "post_content_body" TEXT,
    "matches" JSONB,
    "post_id" TEXT,
    "parent_post_id" TEXT,
    "community_id" TEXT,

    CONSTRAINT "automod_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automod_rule_keyword_settings" (
    "ruleId" TEXT NOT NULL,
    "keywords" TEXT[],

    CONSTRAINT "automod_rule_keyword_settings_pkey" PRIMARY KEY ("ruleId")
);

-- AddForeignKey
ALTER TABLE "automod_rule_keyword_settings" ADD CONSTRAINT "automod_rule_keyword_settings_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automod_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
