/*
  Warnings:

  - Added the required column `enabled` to the `automod_rules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "automod_rules" ADD COLUMN     "enabled" BOOLEAN NOT NULL;
