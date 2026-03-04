"""
Convert extracted law JSONs to the seed format expected by prisma/seed.ts
Format: SeedArticle[] (same as family_law_articles_*.json)
"""
import json
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

CONVERSIONS = [
    {
        "input": "obligations_ar.json",
        "output": "obligations_articles_ar.json",
        "code": "obligations",
        "doc_id": "ma_obligations",
        "language": "ar",
        "source": "Bulletin Officiel",
        "effective_date": "1913-08-12",
    },
    {
        "input": "civil_procedure_ar.json",
        "output": "civil_procedure_articles_ar.json",
        "code": "civil_procedure",
        "doc_id": "ma_civil_procedure",
        "language": "ar",
        "source": "Bulletin Officiel",
        "effective_date": "1974-09-28",
    },
    {
        "input": "penal_code_fr.json",
        "output": None,  # Already in correct format
        "code": "penal",
    },
]


def convert_file(config):
    input_path = os.path.join(DATA_DIR, config["input"])
    if not os.path.exists(input_path):
        print(f"  SKIP {config['input']}: not found")
        return

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Detect format
    if isinstance(data, list):
        # Already in SeedArticle[] format (penal_code_fr.json)
        articles_raw = data
        is_seed_format = True
    elif isinstance(data, dict) and "articles" in data:
        articles_raw = data["articles"]
        is_seed_format = False
    else:
        print(f"  SKIP {config['input']}: unknown format")
        return

    if is_seed_format:
        print(f"  {config['input']}: Already in seed format ({len(articles_raw)} articles)")
        # Just verify format
        return

    # Convert to SeedArticle format
    output_path = os.path.join(DATA_DIR, config["output"])
    seed_articles = []

    for idx, art in enumerate(articles_raw):
        art_num = art["article_number"]
        seed_articles.append({
            "doc_id": config["doc_id"],
            "code": config["code"],
            "article_id": f"{config['doc_id']}:v1:art:{art_num}",
            "article_number": str(art_num),
            "language": config["language"],
            "path": {
                "book": None,
                "title": None,
                "chapter": None,
                "section": None,
            },
            "text": art["text"],
            "source": config["source"],
            "effective_date": config["effective_date"],
            "version": 1,
            "pdf_file": "",
            "pdf_pages": [],
            "order_index": idx,
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(seed_articles, f, ensure_ascii=False, indent=2)

    print(f"  {config['input']} → {config['output']}: {len(seed_articles)} articles")


def main():
    print("Converting extracted law JSONs to seed format...")
    for config in CONVERSIONS:
        convert_file(config)
    print("\nDone! Files ready for seeding.")


if __name__ == "__main__":
    main()
