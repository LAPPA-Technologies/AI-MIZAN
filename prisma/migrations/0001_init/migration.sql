CREATE TABLE "law_articles" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "chapter" TEXT NOT NULL,
  "article_number" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "effective_date" TIMESTAMP(3),
  "version" INTEGER NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "law_articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "law_articles_unique" ON "law_articles" ("code", "chapter", "article_number", "language", "version");
CREATE INDEX "law_articles_code_idx" ON "law_articles" ("code");
CREATE INDEX "law_articles_code_chapter_idx" ON "law_articles" ("code", "chapter");
CREATE INDEX "law_articles_code_article_idx" ON "law_articles" ("code", "article_number");

CREATE TABLE "law_embeddings" (
  "id" TEXT NOT NULL,
  "article_id" TEXT NOT NULL,
  "embedding" DOUBLE PRECISION[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "law_embeddings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "law_embeddings_article_id_key" ON "law_embeddings" ("article_id");

ALTER TABLE "law_embeddings"
  ADD CONSTRAINT "law_embeddings_article_id_fkey"
  FOREIGN KEY ("article_id") REFERENCES "law_articles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "chat_queries" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "grounded" BOOLEAN NOT NULL DEFAULT FALSE,
  "ip" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_queries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_queries_created_at_idx" ON "chat_queries" ("created_at");

CREATE TABLE "chat_citations" (
  "id" TEXT NOT NULL,
  "chat_query_id" TEXT NOT NULL,
  "article_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "article_number" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_citations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_citations_chat_query_id_idx" ON "chat_citations" ("chat_query_id");

ALTER TABLE "chat_citations"
  ADD CONSTRAINT "chat_citations_chat_query_id_fkey"
  FOREIGN KEY ("chat_query_id") REFERENCES "chat_queries"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_citations"
  ADD CONSTRAINT "chat_citations_article_id_fkey"
  FOREIGN KEY ("article_id") REFERENCES "law_articles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "rate_limits" (
  "id" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "window_start" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rate_limits_ip_window_start_key" ON "rate_limits" ("ip", "window_start");
CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits" ("window_start");
