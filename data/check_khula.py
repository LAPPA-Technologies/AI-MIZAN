import json
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find articles with 'خلع' in them
for article in data:
    if 'خلع' in article['text']:
        print(f'Article {article["article_number"]}:')
        print(f'  Chapter: {article["path"]["chapter"]}')
        print(f'  Text: {article["text"][:200]}...')
        print()
        break  # Just show the first one