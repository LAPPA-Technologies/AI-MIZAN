import json
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Search for the specific text
for article in data:
    if 'ألحكام' in article['text'] or 'أعاله' in article['text']:
        print(f'Article {article["article_number"]}:')
        print(f'  Chapter: {article["path"]["chapter"]}')
        print(f'  Text: {article["text"]}')
        print()