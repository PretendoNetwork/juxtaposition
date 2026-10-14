-- CreateTable
CREATE TABLE "audit_log_entries" (
    "id" TEXT NOT NULL,
    "actor" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action_type" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "target_resource_id" TEXT NOT NULL,
    "changed_fields" TEXT[],

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);
