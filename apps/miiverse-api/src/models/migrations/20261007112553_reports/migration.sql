-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "post_author" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reported_by" INTEGER NOT NULL,
    "report_reasonId" INTEGER NOT NULL,
    "report_message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "moderation_note" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
