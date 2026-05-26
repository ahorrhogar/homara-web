-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_price" DECIMAL(12,2),
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_updated_by" TEXT,
ADD COLUMN     "update_mode" TEXT NOT NULL DEFAULT 'manual';
