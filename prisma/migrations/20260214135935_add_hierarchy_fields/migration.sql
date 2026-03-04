/*
  Warnings:

  - A unique constraint covering the columns `[code,book,title,chapter,section,article_number,language,version]` on the table `law_articles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "law_articles_unique";

-- AlterTable
ALTER TABLE "law_articles" ADD COLUMN     "book" TEXT,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "chapter" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "law_articles_code_book_title_chapter_section_article_number_key" ON "law_articles"("code", "book", "title", "chapter", "section", "article_number", "language", "version");

-- RenameIndex
ALTER INDEX "law_articles_code_article_idx" RENAME TO "law_articles_code_article_number_idx";
