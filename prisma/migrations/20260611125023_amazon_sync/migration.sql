-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "availability_type" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "external_source" TEXT,
ADD COLUMN     "is_buy_box_winner" BOOLEAN,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "amazon_scrape_candidates" (
    "id" UUID NOT NULL,
    "asin" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL DEFAULT 'www.amazon.es',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "normalized" JSONB NOT NULL DEFAULT '{}',
    "rawSnapshot" JSONB NOT NULL DEFAULT '{}',
    "source_query" TEXT,
    "suggested_brand" TEXT,
    "discovered_by" TEXT,
    "product_id" UUID,
    "notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amazon_scrape_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amazon_scrape_candidates_asin_key" ON "amazon_scrape_candidates"("asin");

-- CreateIndex
CREATE INDEX "amazon_scrape_candidates_status_created_at_idx" ON "amazon_scrape_candidates"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "offers_merchant_id_external_id_key" ON "offers"("merchant_id", "external_id");

