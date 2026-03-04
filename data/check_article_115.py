import json
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find article 115 (the one with khula text)
for article in data:
    if article['article_number'] == '115':
        print(f'Article {article["article_number"]}:')
        print(f'  Chapter: {article["path"]["chapter"]}')
        print(f'  Full Text: {article["text"]}')
        print()
        break