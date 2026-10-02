-- CreateEnum
CREATE TYPE "ServerAccessLevel" AS ENUM ('Prod', 'Beta', 'Dev');

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
