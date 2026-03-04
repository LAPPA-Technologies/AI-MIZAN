/*
  Warnings:

  - A unique constraint covering the columns `[code,article_number,language,version]` on the table `law_articles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "law_articles_code_book_title_chapter_section_article_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "law_articles_code_article_number_language_version_key" ON "law_articles"("code", "article_number", "language", "version");
