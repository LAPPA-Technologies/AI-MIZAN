import json
import re

def apply_targeted_fixes(json_path):
    """
    Apply targeted fixes for the most common remaining issues
    """
    # Load the JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Targeted corrections based on the remaining issues
    targeted_corrections = [
        # Fix remaining اإل patterns
        ('اإلجراءات', 'الإجراءات'),  # procedures
        ('اإلإيجاب', 'الإيجاب'),     # the offer
        ('اإلقبول', 'القبول'),       # the acceptance
        ('اإلنفقة', 'الإنفقة'),      # the maintenance
        ('اإلحصان', 'الإحصان'),     # the chastity
        ('اإلكراه', 'الإكراه'),     # the coercion
        ('اإلعاقة', 'الإعاقة'),     # the disability
        ('اإلعسار', 'الإعسار'),     # the insolvency
        ('اإلنجاب', 'الإنجاب'),     # the procreation
        ('اإلنذار', 'الإنذار'),     # the warning
        ('اإلنكار', 'الإنكار'),     # the denial
        ('اإلتصديق', 'الإتصديق'),   # the certification
        ('اإلتزام', 'الإلتزام'),    # the commitment

        # Fix remaining األ patterns
        ('األدارية', 'الإدارية'),   # administrative
        ('األهلية', 'الأهلية'),     # eligibility
        ('األقارب', 'الأقارب'),    # relatives
        ('األأب', 'الأب'),         # father
        ('األأم', 'الأم'),         # mother
        ('األولاد', 'الأولاد'),    # children
        ('األزواج', 'الأزواج'),    # husbands
        ('األجدود', 'الأجدود'),    # grandparents

        # Fix remaining اآل patterns
        ('اآلقتصادية', 'الإقتصادية'), # economic
        ('اآلشخاص', 'الأشخاص'),   # persons
        ('اآلأحوال', 'الأحوال'),   # conditions
        ('اآلأمور', 'الأمور'),     # matters

        # Fix double lam issues
        ('الالجئين', 'اللاجئين'), # refugees
        ('الالزام', 'الالتزام'),  # obligation

        # Fix remaining أل patterns
        ('ألحكام', 'الأحكام'),     # rules
        ('ألزوجين', 'الأزوجين'),  # spouses
        ('ألخلع', 'الألخلع'),     # khula
        ('ألطلاق', 'الألطلاق'),   # divorce
    ]

    total_corrections = 0
    articles_corrected = 0

    for article in data:
        if article.get('language') == 'ar':
            original_text = article['text']
            corrected_text = original_text

            # Apply all targeted corrections
            for old_text, new_text in targeted_corrections:
                corrected_text = corrected_text.replace(old_text, new_text)

            # Check if text was changed
            if corrected_text != original_text:
                article['text'] = corrected_text
                articles_corrected += 1

                # Count corrections
                for old_text, _ in targeted_corrections:
                    if old_text in original_text:
                        total_corrections += original_text.count(old_text)

    # Save the corrected data
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Applied targeted fixes to {articles_corrected} articles")
    print(f"Total targeted corrections made: {total_corrections}")

    return articles_corrected, total_corrections

def final_check(json_path):
    """
    Final comprehensive check for any remaining issues
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Comprehensive check for any Arabic text issues
    suspicious_patterns = [
        r'األ',   # Missing hamza patterns
        r'اإل',
        r'اآل',
        r'أل',
        r'الال',  # Double lam
        r'\.أ',   # Period before word
    ]

    remaining_issues = 0
    clean_articles = 0

    for article in data:
        if article.get('language') == 'ar':
            text = article['text']
            has_issues = False

            for pattern in suspicious_patterns:
                if re.search(pattern, text):
                    has_issues = True
                    break

            if has_issues:
                remaining_issues += 1
            else:
                clean_articles += 1

    total_arabic_articles = remaining_issues + clean_articles
    print(f"\nFinal check results:")
    print(f"- Total Arabic articles: {total_arabic_articles}")
    print(f"- Clean articles: {clean_articles}")
    print(f"- Articles with remaining issues: {remaining_issues}")

    if remaining_issues == 0:
        print("🎉 SUCCESS: All Arabic text corruption has been fixed!")
        return True
    else:
        print(f"📋 {remaining_issues} articles still need attention")
        return False

if __name__ == "__main__":
    json_path = "family_law_articles_ar.json"

    print("Applying targeted fixes for remaining Arabic text issues...")
    corrected_articles, total_fixes = apply_targeted_fixes(json_path)

    success = final_check(json_path)

    if success:
        print("\n✅ All Arabic text issues have been resolved!")
        print("The JSON file now contains properly corrected Arabic legal text.")
    else:
        print("\n⚠️  Some issues remain - may need manual review of complex cases")