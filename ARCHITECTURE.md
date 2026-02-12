# AI Mizan Architecture

## 1) Product scope

AI Mizan is a legal guidance system for Morocco focused on intake, triage, and law-grounded information. It is not a law firm and does not provide legal advice.

## 2) Core pillars

- Verified Moroccan law library in Arabic and French
- Plain-language explanations (Darija, Arabic, French)
- AI legal chat with clarifying questions and citations
- Guided "My Situation" flows
- Auto-update system with human review
- Trust layer with sources and visible update dates

## 3) Data model (relational)

### Laws and sources

- `laws`
  - `id`, `law_number`, `title_ar`, `title_fr`, `category`, `status`
- `law_versions`
  - `id`, `law_id`, `version_label`, `published_on`, `effective_on`, `source_id`
- `articles`
  - `id`, `law_id`, `article_number`, `status`
- `article_versions`
  - `id`, `article_id`, `law_version_id`, `content_ar`, `content_fr`, `modified_on`
- `article_explanations`
  - `id`, `article_version_id`, `lang`, `plain_text`, `practical_notes`
- `sources`
  - `id`, `name`, `url`, `publisher`, `published_on`
- `update_events`
  - `id`, `law_id`, `article_id`, `change_type`, `summary`, `source_id`, `published_on`

### Guidance and flows

- `flows`
  - `id`, `name`, `category`, `lang`, `version`, `status`
- `flow_steps`
  - `id`, `flow_id`, `step_order`, `question`, `input_type`, `options_json`
- `flow_rules`
  - `id`, `flow_id`, `rule_json`, `linked_articles_json`
- `flow_outputs`
  - `id`, `flow_id`, `template_json`, `next_steps`

### Chat and audit

- `chat_sessions`
  - `id`, `user_id`, `lang`, `started_at`, `ended_at`
- `chat_messages`
  - `id`, `session_id`, `role`, `content`, `created_at`
- `citations`
  - `id`, `message_id`, `article_version_id`, `snippet`, `law_number`
- `audit_logs`
  - `id`, `action`, `actor`, `created_at`, `metadata_json`

## 4) Update pipeline

1. **Source capture** from Bulletin Officiel and ministry portals.
2. **Parsing** into structured law, article, and version records.
3. **Human review** by legal editor before publish.
4. **Publish** with visible update date and change summary.

## 5) Retrieval and AI grounding

- Use a hybrid search (keyword + vector) to find relevant articles.
- Always return responses with citations to `article_versions`.
- Provide a plain-language explanation and "what this means in practice".

## 6) Safety and compliance

- Prominent disclaimer: guidance only, not legal advice.
- Escalation prompts: "consult a lawyer" for high-risk situations.
- No hallucinated laws: all responses must link to the library.

## 7) Trust layer

- Each article shows:
  - source link
  - last update date
  - modification history
- Visible "Updated on" date per law and per article.
- No ads in early stages to preserve credibility.

## 8) Suggested stack

- Data: PostgreSQL for law library and versioning
- Search: Postgres full-text + vector store
- Ingestion: worker queue + parser service
- Web: static site + API

## 9) Next implementation tasks

- Build law library ingestion from official sources.
- Create flow templates for rental, family, labor, police, residency, accident.
- Implement AI response policy with citation requirements.
- Add monitoring for update freshness and failed ingestions.
