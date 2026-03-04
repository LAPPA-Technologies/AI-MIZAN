import json
import re

# Load the data
with open('family_law_articles_ar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Expanded patterns for Arabic text corruption
patterns_to_check = [
    # Missing hamza patterns
    (r'األ([ا-ي])', 'Missing hamza at start (األ → الأل)'),
    (r'اإل([ا-ي])', 'Missing hamza with kasra (اإل → الإل)'),
    (r'ألحكام\b', 'Rules without hamza (ألحكام → الأحكام)'),
    (r'ألزوجين\b', 'Spouses without hamza (ألزوجين → الأزوجين)'),
    (r'ألخلع\b', 'Khula without hamza (ألخلع → الألخلع)'),
    (r'ألطالق\b', 'Divorce without hamza (ألطالق → الألطالق)'),
    (r'ألان\b', 'An without hamza (ألان → الأن)'),
    (r'ألأ\b', 'Alif without hamza (ألأ → الأ)'),

    # Double lam issues
    (r'الال([ا-ي])', 'Double lam (الال → ال)'),
    (r'الان([ا-ي])', 'Missing hamza in an words (الان → الأن)'),

    # Other corruption patterns
    (r'انحالل\b', 'Dissolution without hamza (انحالل → انحلال)'),
    (r'\.أ([ا-ي])', 'Period before word fragment (.أ → proper text)'),
    (r'([ا-ي])أ\.([ا-ي])', 'Fragmented words with periods'),
]

print('Comprehensive analysis of Arabic text corruption issues...')
print('=' * 60)

found_issues = []
issue_counts = {}

for i, article in enumerate(data):
    text = article['text']
    article_num = article['article_number']

    for pattern, description in patterns_to_check:
        matches = re.findall(pattern, text)
        if matches:
            if article_num not in issue_counts:
                issue_counts[article_num] = []
            issue_counts[article_num].append((pattern, description, len(matches)))

            found_issues.append({
                'article_num': article_num,
                'pattern': pattern,
                'description': description,
                'matches': matches,
                'text_snippet': text[:150] + '...' if len(text) > 150 else text
            })

print(f'Total articles with issues: {len(issue_counts)}')
print(f'Total individual issues found: {len(found_issues)}')
print()

# Group by article
print('Issues by article:')
for article_num in sorted(issue_counts.keys(), key=int):
    issues = issue_counts[article_num]
    print(f'Article {article_num}: {len(issues)} issues')
    for pattern, desc, count in issues:
        print(f'  - {desc} ({count} occurrences)')

print()
print('Sample of specific issues:')
for i, issue in enumerate(found_issues[:15]):
    print(f'{i+1}. Article {issue["article_num"]}: {issue["description"]}')
    print(f'   Pattern: {issue["pattern"]}')
    print(f'   Text: {issue["text_snippet"]}')
    print()

if len(found_issues) > 15:
    print(f'... and {len(found_issues) - 15} more issues found.')