import json

# Check all language versions of article 115
files = ['family_law_articles_ar.json', 'family_law_articles_fr.json', 'family_law_articles_en.json']

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for article in data:
            if article['article_number'] == '115':
                print(f'{file}:')
                print(f'  {article["text"][:200]}...')
                print()
                break
    except FileNotFoundError:
        print(f'{file}: Not found')