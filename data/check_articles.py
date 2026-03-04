import json
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Look at first few articles
for i, article in enumerate(data[:5]):
    print(f'Article {i+1}:')
    print(f'  Chapter: {article["path"]["chapter"]}')
    print(f'  Text preview: {article["text"][:100]}...')
    print()