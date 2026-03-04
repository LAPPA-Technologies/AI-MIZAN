import json
import re

# Load the data
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Common hamza patterns to search for
patterns_to_check = [
    r'األ([ا-ي])',  # Missing hamza at start
    r'اإل([ا-ي])',  # Missing hamza with kasra
    r'ألحكام\b',    # Rules without hamza
    r'ألزوجين\b',  # Spouses without hamza
    r'ألخلع\b',    # Khula without hamza
    r'ألطالق\b',   # Divorce without hamza
    r'الال([ا-ي])', # Double lam
    r'الان([ا-ي])', # Missing hamza in 'an' words
    r'انحالل\b',   # Dissolution without hamza
]

print('Searching for remaining hamza issues...')
found_issues = []

for i, article in enumerate(data):
    text = article['text']
    for pattern in patterns_to_check:
        if re.search(pattern, text):
            found_issues.append({
                'article_num': article['article_number'],
                'pattern': pattern,
                'text_snippet': text[:100] + '...' if len(text) > 100 else text
            })

print(f'Found {len(found_issues)} potential issues:')
for issue in found_issues[:10]:  # Show first 10
    print(f'Article {issue["article_num"]}: {issue["pattern"]}')
    print(f'  Text: {issue["text_snippet"]}')
    print()

if len(found_issues) > 10:
    print(f'... and {len(found_issues) - 10} more issues found.')