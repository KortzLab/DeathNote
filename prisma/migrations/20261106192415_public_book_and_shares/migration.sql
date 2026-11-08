-- CreateEnum
CREATE TYPE "ReportTarget" AS ENUM ('public_entry', 'shared_note');

-- CreateTable
CREATE TABLE "public_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cause" TEXT,
    "details" TEXT,
    "time" TEXT,
    "pen_name" TEXT,
    "author_id" TEXT,
    "owner_hash" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "candles" INTEGER NOT NULL DEFAULT 0,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "hidden_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_notes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cause" TEXT,
    "details" TEXT,
    "time" TEXT,
    "pen_name" TEXT,
    "blur_name" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'notebook',
    "author_id" TEXT,
    "owner_hash" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "candles" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "hidden_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "target_type" "ReportTarget" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candles" (
    "target_type" "ReportTarget" NOT NULL,
    "target_id" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candles_pkey" PRIMARY KEY ("target_type","target_id","ip_hash")
);

-- CreateIndex
CREATE INDEX "public_entries_hidden_at_created_at_idx" ON "public_entries"("hidden_at", "created_at");

-- CreateIndex
CREATE INDEX "shared_notes_hidden_at_created_at_idx" ON "shared_notes"("hidden_at", "created_at");

-- CreateIndex
CREATE INDEX "reports_resolved_at_created_at_idx" ON "reports"("resolved_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reports_target_type_target_id_ip_hash_key" ON "reports"("target_type", "target_id", "ip_hash");

-- AddForeignKey
ALTER TABLE "public_entries" ADD CONSTRAINT "public_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_notes" ADD CONSTRAINT "shared_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
