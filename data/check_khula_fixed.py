import json
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Search for articles containing 'الطالق بالخلع'
for article in data:
    if 'الطالق بالخلع' in article['text']:
        print(f'Article {article["article_number"]}:')
        print(f'  Text: {article["text"]}')
        print()
        break