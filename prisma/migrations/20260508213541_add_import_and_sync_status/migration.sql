-- CreateTable
CREATE TABLE "import_jobs" (
    "id" UUID NOT NULL,
    "user_id" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_job_logs" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "row_index" INTEGER,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_status" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "last_success_at" TIMESTAMP(3),
    "last_error_at" TIMESTAMP(3),
    "message" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_jobs_created_at_idx" ON "import_jobs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "import_job_logs_job_id_created_at_idx" ON "import_job_logs"("job_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sync_status_source_key" ON "sync_status"("source");

-- AddForeignKey
ALTER TABLE "import_job_logs" ADD CONSTRAINT "import_job_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
