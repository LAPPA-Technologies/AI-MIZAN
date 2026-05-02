-- AlterTable
ALTER TABLE "law_articles" ADD COLUMN     "extraction_quality" TEXT,
ADD COLUMN     "source_document" TEXT,
ADD COLUMN     "source_page" INTEGER;
