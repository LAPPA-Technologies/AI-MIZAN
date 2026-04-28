export interface GuideSection {
  id: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  contentAr: string;
  contentFr: string;
  contentEn: string;
  articleRefs?: Array<{
    number: string;
    code: string;
    labelAr: string;
  }>;
}

export interface Guide {
  slug: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  category: "family" | "labor" | "housing" | "business" | "criminal" | "reform";
  relatedCalculator?: string;
  relatedLawCode?: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  sections: GuideSection[];
  keyPoints: {
    ar: string[];
    fr: string[];
    en: string[];
  };
  faqs: Array<{
    questionAr: string;
    questionFr: string;
    questionEn: string;
    answerAr: string;
    answerFr: string;
    answerEn: string;
  }>;
}

export const GUIDES: Guide[] = [
  {
    slug: "calcul-heritage-maroc",
    titleAr: "دليل الإرث والفرائض في المغرب",
    titleFr: "Héritage au Maroc — Guide des Farâ'id",
    titleEn: "Inheritance in Morocco — Faraid Guide",
    descriptionAr:
      "دليل شامل لحساب حصص الإرث الشرعية في المغرب وفق مدونة الأسرة والفرائض الإسلامية، مع أمثلة عملية وحاسبة مجانية.",
    descriptionFr:
      "Guide complet pour calculer les parts d'héritage au Maroc selon la Moudawana et le droit islamique, avec exemples pratiques et calculateur gratuit.",
    descriptionEn:
      "Complete guide to calculating inheritance shares in Morocco according to the Moudawana and Islamic law, with practical examples and a free calculator.",
    category: "family",
    relatedCalculator: "heritage",
    relatedLawCode: "family_code",
    publishedAt: "2026-04-27",
    updatedAt: "2026-04-27",
    readingTimeMinutes: 8,
    keyPoints: {
      ar: [
        "الإرث في المغرب محكوم بمدونة الأسرة (المواد 321-395) المستندة إلى الفقه المالكي",
        "قبل التوزيع: تُخصم الديون ومصاريف الجنازة والوصية (لا تتجاوز الثلث)",
        "للذكر مثل حظ الأنثيين في التعصيب — لكن للبنات حصص مقدرة عند غياب الأبناء",
        "العصبة (كالابن) يرث الباقي بعد أصحاب الفروض",
        "يجب توثيق التركة رسمياً عبر عدل أو محامٍ",
      ],
      fr: [
        "L'héritage au Maroc est régi par la Moudawana (Art. 321-395) basée sur le fiqh malikite",
        "Avant distribution: déduire les dettes, frais funéraires et legs (max 1/3)",
        "Le fils hérite du double de la fille en cas de ta'sib",
        "L'asaba (comme le fils) hérite du résidu après les ayants droit à quote-part fixe",
        "La succession doit être documentée officiellement par un adoul ou avocat",
      ],
      en: [
        "Inheritance in Morocco is governed by the Moudawana (Art. 321-395) based on Maliki fiqh",
        "Before distribution: deduct debts, funeral costs and bequest (max 1/3 of estate)",
        "A son inherits double a daughter's share in ta'sib — but daughters have fixed shares without sons",
        "The asaba (like a son) inherits the residue after fixed-share heirs",
        "The estate must be officially documented through an adoul or lawyer",
      ],
    },
    sections: [
      {
        id: "intro",
        titleAr: "الإرث في المغرب — نظرة عامة",
        titleFr: "L'héritage au Maroc — Vue d'ensemble",
        titleEn: "Inheritance in Morocco — Overview",
        contentAr: `يُعدّ الإرث من أكثر المسائل القانونية حساسية وتعقيداً في المغرب. فهو يجمع بين أحكام الشريعة الإسلامية المستمدة من القرآن الكريم والسنة النبوية، والتنظيم القانوني الذي أفردته مدونة الأسرة (القانون 70-03) في كتابها السادس، من المادة 321 إلى المادة 395.

يتميز نظام المواريث المغربي بدقته الحسابية وقواعده الصارمة التي تحدد نصيب كل وارث بشكل لا يترك مجالاً للاجتهاد في الأنصبة المحددة شرعاً. فكل وارث له حصة مقدرة بدقة وفق درجة قرابته من المتوفى وجنسه ووجود أو غياب الورثة الآخرين.

الجدير بالذكر أن المغرب اعتمد المذهب المالكي أساساً لنظامه في المواريث، مع بعض الاجتهادات المستمدة من السياسة الشرعية. ويختص قضاء الأسرة بالنظر في النزاعات المتعلقة بالتركات، في حين يتولى العدول توثيق الإراثة.`,
        contentFr: `L'héritage est l'une des questions juridiques les plus sensibles et complexes au Maroc. Il combine les règles de la charia islamique tirées du Coran et de la Sunna, et l'organisation juridique prévue par la Moudawana (Loi 70-03) dans son sixième livre, des articles 321 à 395.

Le système successoral marocain se distingue par sa précision arithmétique et ses règles strictes qui déterminent la part de chaque héritier sans laisser de marge d'interprétation pour les quotes-parts fixées par la loi islamique. Chaque héritier a une part précisément calculée selon son degré de parenté avec le défunt, son sexe et la présence ou l'absence d'autres héritiers.

Il convient de noter que le Maroc a adopté le rite malékite comme base de son système successoral, avec quelques ijtihad issus de la politique juridique islamique. Les affaires litigieuses relèvent des tribunaux de la famille, tandis que les adouls se chargent de la documentation de l'hérédité.`,
        contentEn: `Inheritance is one of the most sensitive and complex legal matters in Morocco. It combines Islamic sharia rules drawn from the Quran and Sunna with the legal framework provided by the Moudawana (Law 70-03) in its sixth book, Articles 321 to 395.

The Moroccan inheritance system is characterized by its arithmetical precision and strict rules that determine each heir's share without leaving room for interpretation of the legally fixed quotas. Each heir has a precisely calculated share based on their degree of kinship with the deceased, their gender, and the presence or absence of other heirs.

It is worth noting that Morocco adopted the Maliki rite as the basis of its inheritance system, with some ijtihad drawn from Islamic legal policy. Contested cases fall under family courts, while adouls handle the official documentation of estates.`,
        articleRefs: [
          { number: "321", code: "family_code", labelAr: "تعريف التركة" },
          { number: "322", code: "family_code", labelAr: "أركان الإرث" },
        ],
      },
      {
        id: "before-distribution",
        titleAr: "قبل التوزيع — الحقوق المتعلقة بالتركة",
        titleFr: "Avant la distribution — Les droits liés à la succession",
        titleEn: "Before Distribution — Rights Related to the Estate",
        contentAr: `قبل توزيع الإرث على الورثة، يجب الوفاء بالحقوق التالية بالترتيب، وفق ما نصّت عليه الآية الكريمة (النساء: 11-12): "مِن بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ"

**1. مصاريف الجنازة والدفن** — تُخصم أولاً من التركة، وتشمل تجهيز الميت وإقامة مراسم الدفن وفق العرف المعمول به.

**2. الديون** — تُسدَّد كاملاً قبل أي توزيع (المادة 322). تشمل كل ما في ذمة المتوفى من ديون للأشخاص أو للمؤسسات المالية أو للدولة، بما فيها القروض البنكية والإيجارات المتأخرة.

**3. الوصية** — لا تتجاوز ثلث الباقي بعد الديون والجنازة، ولا تكون لوارث. يمكن للمتوفى أن يوصي بما لا يتجاوز ثلث تركته لأي شخص أو جهة خيرية، شريطة ألا يكون المستفيد من الورثة.

**4. ما تبقى** — يُوزَّع على الورثة وفق قواعد الفرائض المقدرة في القانون.

الخطأ الشائع: كثير من العائلات تبدأ بتوزيع الممتلكات قبل تسوية الديون، مما يُعرّض الورثة للمساءلة القانونية لاحقاً.`,
        contentFr: `Avant de distribuer l'héritage aux héritiers, il faut s'acquitter des droits suivants dans l'ordre, conformément au verset coranique (An-Nisa: 11-12): "après exécution du testament et acquittement des dettes"

**1. Frais funéraires** — déduits en premier de la succession, incluant les préparatifs funèbres et les cérémonies d'inhumation selon les usages.

**2. Dettes** — remboursées intégralement avant toute distribution (Art. 322). Comprend toutes les dettes du défunt envers des personnes, des institutions financières ou l'État, y compris les prêts bancaires et les loyers impayés.

**3. Legs** — ne dépassant pas le tiers du reste après dettes et frais funéraires, et ne pouvant bénéficier à un héritier. Le défunt peut léguer jusqu'au tiers de sa succession à toute personne ou œuvre caritative, à condition que le bénéficiaire ne soit pas un héritier.

**4. Le solde** — distribué selon les règles des quotes-parts légales.`,
        contentEn: `Before distributing the inheritance to heirs, the following rights must be settled in order, in accordance with the Quranic verse (An-Nisa: 11-12): "after execution of the bequest and payment of debts"

**1. Funeral expenses** — deducted first from the estate, including funeral preparations and burial ceremonies according to custom.

**2. Debts** — repaid in full before any distribution (Art. 322). Includes all debts of the deceased to individuals, financial institutions, or the State, including bank loans and unpaid rent.

**3. Bequest** — not exceeding one third of the remainder after debts and funeral expenses, and cannot benefit an heir. The deceased may bequeath up to one third of their estate to any person or charitable cause, provided the beneficiary is not an heir.

**4. The balance** — distributed to the heirs according to the legally fixed share rules.

Common mistake: Many families begin distributing assets before settling debts, which can expose heirs to legal liability at a later stage.`,
        articleRefs: [
          { number: "322", code: "family_code", labelAr: "الحقوق المتعلقة بالتركة" },
        ],
      },
      {
        id: "heirs-categories",
        titleAr: "من يرث؟ — فئات الورثة",
        titleFr: "Qui hérite ? — Catégories d'héritiers",
        titleEn: "Who Inherits? — Heir Categories",
        contentAr: `يُقسَّم الورثة في القانون المغربي إلى فئتين رئيسيتين:

**أصحاب الفروض** — ورثة لهم حصص مقدرة نصّ عليها القرآن الكريم مباشرة:
الزوج أو الزوجة، الأب، الأم، البنت، بنت الابن، الأخت الشقيقة، الأخت لأب، الأخ والأخت لأم.

**العصبة** — يرثون الباقي بعد استيفاء أصحاب الفروض حصصهم، وبعضهم يحجب بعضاً:
الابن وابن الابن (مهما نزل)، الأخ الشقيق، الأخ لأب، العم الشقيق، ابن العم...

**القاعدة الذهبية:** للذكر مثل حظ الأنثيين في التعصيب — غير أن هذه القاعدة لا تنطبق دائماً. فالبنات لهن حصص مقدرة عند غياب الأبناء: البنت الواحدة ترث النصف، والبنتان فأكثر يرثن الثلثين.

**الحجب:** بعض الورثة يحجبون آخرين كلياً أو جزئياً. مثلاً: الابن يحجب الأخ، والأب يحجب الجد.`,
        contentFr: `Les héritiers sont divisés en deux catégories principales en droit marocain:

**Ayants droit à quote-part fixe (Ashabu al-furud)** — héritiers dont les parts sont directement fixées par le Coran:
Époux/épouse, père, mère, fille, fille du fils, sœur germaine, sœur consanguine, frère/sœur utérin(e).

**Résidualités (Asaba)** — héritent du résidu après que les ayants droit à quote-part fixe aient reçu leurs parts:
Fils et fils du fils, frère germain, frère consanguin, oncle paternel germain, fils de l'oncle...

**Règle d'or:** le fils hérite du double de la fille en ta'sib — mais cette règle ne s'applique pas toujours. Les filles ont des parts fixes en l'absence de fils: la fille unique hérite de la moitié, deux filles et plus héritent des deux tiers.

**Exclusion (Hajb):** certains héritiers excluent d'autres totalement ou partiellement. Par exemple: le fils exclut le frère, le père exclut le grand-père.`,
        contentEn: `Heirs in Moroccan law are divided into two main categories:

**Fixed-share heirs (Ashabu al-furud)** — heirs whose shares are directly fixed by the Quran:
Husband or wife, father, mother, daughter, son's daughter, full sister, paternal half-sister, maternal half-brother/sister.

**Residuary heirs (Asaba)** — inherit the residue after fixed-share heirs have received their portions, and some exclude others:
Son and son's son (however far down), full brother, paternal half-brother, full paternal uncle, son of uncle...

**Golden rule:** a son inherits double a daughter's share in ta'sib — but this rule does not always apply. Daughters have fixed shares in the absence of sons: a single daughter inherits half, two or more daughters inherit two thirds.

**Exclusion (Hajb):** some heirs exclude others wholly or partially. For example: a son excludes a brother, a father excludes a grandfather.`,
        articleRefs: [
          { number: "335", code: "family_code", labelAr: "أصحاب الفروض المقدرة" },
          { number: "341", code: "family_code", labelAr: "حصة الزوج والزوجة" },
        ],
      },
      {
        id: "shares",
        titleAr: "الحصص المقدرة — جدول الفرائض",
        titleFr: "Les quotes-parts — Tableau des Farâ'id",
        titleEn: "Fixed Shares — Faraid Table",
        contentAr: `الفروض المقدرة في القانون المغربي ستة: النصف، الربع، الثمن، الثلثان، الثلث، السدس.

| الوارث | الحصة | الشرط |
|--------|-------|-------|
| الزوج | 1/2 | بدون أبناء أو أبناء ابن |
| الزوج | 1/4 | مع أبناء أو أبناء ابن |
| الزوجة / الزوجات | 1/4 | بدون أبناء أو أبناء ابن |
| الزوجة / الزوجات | 1/8 | مع أبناء أو أبناء ابن |
| البنت الواحدة | 1/2 | بدون ابن |
| بنتان فأكثر | 2/3 | بدون ابن |
| الأم | 1/3 | بدون فرع وارث أو جمع من الإخوة |
| الأم | 1/6 | مع فرع وارث أو جمع من الإخوة |
| الأب | 1/6 + تعصيب | مع ابن |
| الأب | تعصيب | بدون فرع وارث |

ملاحظة: في حالة تجاوز مجموع الحصص الواحد الصحيح، يُطبَّق مبدأ "العَوْل" (التخفيض النسبي)، وفي حالة نقصانها، يُطبَّق "الرَّدّ" (إعادة الفائض على الورثة).`,
        contentFr: `Les six quotes-parts légales en droit marocain: la moitié, le quart, le huitième, les deux tiers, le tiers, le sixième.

| Héritier | Quote-part | Condition |
|----------|-----------|-----------|
| Mari | 1/2 | Sans descendants |
| Mari | 1/4 | Avec descendants |
| Épouse(s) | 1/4 | Sans descendants |
| Épouse(s) | 1/8 | Avec descendants |
| Fille unique | 1/2 | Sans fils |
| 2+ filles | 2/3 | Sans fils |
| Mère | 1/3 | Sans descendants ni groupe de frères |
| Mère | 1/6 | Avec descendants ou groupe de frères |
| Père | 1/6 + résidu | Avec fils |
| Père | résidu | Sans descendants |

Note: Si la somme des parts dépasse l'unité, on applique le principe de l'awl (réduction proportionnelle). Si elle est inférieure, on applique le radd (retour de l'excédent aux héritiers).`,
        contentEn: `The six fixed shares in Moroccan law are: half, quarter, eighth, two-thirds, third, and sixth.

| Heir | Share | Condition |
|------|-------|-----------|
| Husband | 1/2 | No descendants |
| Husband | 1/4 | With descendants |
| Wife/Wives | 1/4 | No descendants |
| Wife/Wives | 1/8 | With descendants |
| Single daughter | 1/2 | No son |
| 2+ daughters | 2/3 | No son |
| Mother | 1/3 | No descendants or group of siblings |
| Mother | 1/6 | With descendants or group of siblings |
| Father | 1/6 + residue | With son |
| Father | residue | No descendants |

Note: If the sum of shares exceeds one, the principle of awl (proportional reduction) applies. If it falls short, the radd (return of surplus to heirs) applies.`,
        articleRefs: [
          { number: "346", code: "family_code", labelAr: "حصة الأم" },
          { number: "347", code: "family_code", labelAr: "حصة الأب" },
        ],
      },
      {
        id: "example",
        titleAr: "مثال عملي — تركة 500,000 درهم",
        titleFr: "Exemple pratique — Succession de 500 000 MAD",
        titleEn: "Practical Example — 500,000 MAD Estate",
        contentAr: `**الخطوة الأولى — تحديد الورثة وحصصهم**

| الوارث | النوع | الحصة الشرعية |
|--------|-------|---------------|
| الزوجة | فرض مقدر | 1/8 (لوجود أبناء) |
| الابن | عصبة | الباقي — وحدتان |
| البنت | عصبة مع الأخ | الباقي — وحدة |

**الخطوة الثانية — الحساب**

- الزوجة: 500,000 × 1/8 = **62,500 درهم**
- الباقي للتعصيب: 500,000 × 7/8 = **437,500 درهم**
- إجمالي الوحدات: 2 (ابن) + 1 (بنت) = 3 وحدات
- قيمة الوحدة: 437,500 ÷ 3 = **145,833 درهم**
- **الابن: 145,833 × 2 = 291,667 درهم**
- **البنت: 145,833 × 1 = 145,833 درهم**

**التحقق:** 62,500 + 291,667 + 145,833 = 500,000 ✓`,
        contentFr: `**Étape 1 — Identifier les héritiers et leurs parts**

| Héritier | Type | Quote-part légale |
|----------|------|-------------------|
| Épouse | Quote-part fixe | 1/8 (avec enfants) |
| Fils | Résidualité | Résidu — 2 unités |
| Fille | Résidualité avec frère | Résidu — 1 unité |

**Étape 2 — Le calcul**

- Épouse: 500 000 × 1/8 = **62 500 MAD**
- Résidu pour ta'sib: 500 000 × 7/8 = **437 500 MAD**
- Total unités: 2 (fils) + 1 (fille) = 3 unités
- Valeur unitaire: 437 500 ÷ 3 = **145 833 MAD**
- **Fils: 145 833 × 2 = 291 667 MAD**
- **Fille: 145 833 × 1 = 145 833 MAD**

**Vérification:** 62 500 + 291 667 + 145 833 = 500 000 ✓`,
        contentEn: `**Step 1 — Identify heirs and their shares**

| Heir | Type | Legal share |
|------|------|-------------|
| Wife | Fixed share | 1/8 (with children) |
| Son | Residuary | Residue — 2 units |
| Daughter | Residuary with brother | Residue — 1 unit |

**Step 2 — The calculation**

- Wife: 500,000 × 1/8 = **62,500 MAD**
- Residue for ta'sib: 500,000 × 7/8 = **437,500 MAD**
- Total units: 2 (son) + 1 (daughter) = 3 units
- Unit value: 437,500 ÷ 3 = **145,833 MAD**
- **Son: 145,833 × 2 = 291,667 MAD**
- **Daughter: 145,833 × 1 = 145,833 MAD**

**Verification:** 62,500 + 291,667 + 145,833 = 500,000 ✓`,
      },
      {
        id: "documentation",
        titleAr: "توثيق التركة رسمياً",
        titleFr: "Documentation officielle de la succession",
        titleEn: "Official Documentation of the Estate",
        contentAr: `بعد حساب الحصص، لا بد من التوثيق الرسمي قبل أي نقل للملكية. المستندات المطلوبة عادةً:

**1. رسم الإراثة** — وثيقة رسمية تُحررها العدول، تُثبت صفة الوارث وحصته. لا يمكن نقل ملكية العقارات دون هذه الوثيقة. لاستخراجها تحتاج: شهادة الوفاة + بطاقات التعريف الوطنية للورثة + شاهدَي عدل.

**2. شهادة الوفاة** — الوثيقة الأساسية لكل الإجراءات. تُستخرج من دائرة الحالة المدنية المختصة.

**3. عقود الملكية** — لكل أصول المتوفى (عقارات، سيارات، حسابات بنكية).

**4. عقد التفويت** — إذا أراد الورثة بيع عقار بالتراضي.

**التكاليف التقريبية:**
- رسم الإراثة: 500 إلى 2,000 درهم (حسب العدل وتعقيد الملف)
- رسوم التسجيل العقاري: تتفاوت حسب قيمة العقار
- أتعاب المحامي (اختياري): 2,000 إلى 10,000 درهم`,
        contentFr: `Après le calcul des parts, la documentation officielle est indispensable avant tout transfert de propriété. Documents généralement requis:

**1. Acte d'hérédité (Rasm al-Ira'tha)** — document officiel établi par les adouls, attestant la qualité d'héritier et sa part. Le transfert de propriété immobilière est impossible sans ce document. Pour l'obtenir: certificat de décès + CNI des héritiers + deux adouls témoins.

**2. Certificat de décès** — document de base pour toutes les procédures. À obtenir auprès de l'état civil compétent.

**3. Titres de propriété** — pour tous les actifs du défunt (immeubles, véhicules, comptes bancaires).

**4. Acte de cession** — si les héritiers souhaitent vendre un bien immobilier à l'amiable.

**Coûts approximatifs:**
- Acte d'hérédité: 500 à 2 000 MAD (selon l'adoul et la complexité du dossier)
- Frais d'enregistrement foncier: variables selon la valeur du bien
- Honoraires d'avocat (optionnel): 2 000 à 10 000 MAD`,
        contentEn: `After calculating the shares, official documentation is required before any property transfer can take place. Documents generally needed:

**1. Certificate of Heirship (Rasm al-Ira'tha)** — an official document drawn up by adouls, certifying each heir's status and share. Property transfers are impossible without this document. To obtain it: death certificate + national ID cards of all heirs + two adoul witnesses.

**2. Death certificate** — the foundational document for all procedures. Obtained from the relevant civil registry office.

**3. Title deeds** — for all assets of the deceased (real estate, vehicles, bank accounts).

**4. Transfer deed** — if the heirs wish to sell a property by mutual agreement.

**Approximate costs:**
- Certificate of heirship: 500 to 2,000 MAD (depending on the adoul and file complexity)
- Land registration fees: vary by property value
- Lawyer fees (optional): 2,000 to 10,000 MAD`,
      },
    ],
    faqs: [
      {
        questionAr: "هل يمكن حرمان وارث من الإرث في المغرب؟",
        questionFr: "Peut-on déshériter un héritier au Maroc?",
        questionEn: "Can an heir be disinherited in Morocco?",
        answerAr:
          "لا. لا يمكن حرمان وارث شرعي من نصيبه في الإرث وفق القانون المغربي. الوصية لا تكون للوارث ولا تتجاوز ثلث التركة. حتى لو كتب الشخص وصية تحرم أحد الورثة، فإن تلك الوصية لا تُنفَّذ بالنسبة للحصة الشرعية للوارث.",
        answerFr:
          "Non. Un héritier légal ne peut pas être déshérité selon la loi marocaine. Le legs ne peut pas bénéficier à un héritier et ne peut dépasser le tiers de la succession. Même si le défunt a rédigé un testament déshéritant un héritier, ce testament ne s'applique pas à la part légale de cet héritier.",
        answerEn:
          "No. A legal heir cannot be disinherited under Moroccan law. A bequest cannot benefit an heir and cannot exceed one third of the estate. Even if the deceased wrote a will disinheriting an heir, that will does not apply to the heir's legally fixed share.",
      },
      {
        questionAr: "هل ترث المرأة مثل الرجل في المغرب؟",
        questionFr: "La femme hérite-t-elle autant que l'homme au Maroc?",
        questionEn: "Does a woman inherit the same as a man in Morocco?",
        answerAr:
          "يختلف الأمر حسب الحالة. في التعصيب (كالأبناء والبنات معاً)، للذكر مثل حظ الأنثيين. لكن في حالات أخرى، قد ترث المرأة نفس حصة الرجل أو أكثر — مثلاً: الأخ والأخت لأم يرثان بالتساوي (كل منهما السدس)، وعند انفراد الأم، ترث الثلث بينما يرث الأب السدس فقط في وجود أبناء.",
        answerFr:
          "Cela dépend de la situation. En cas de ta'sib (fils et filles ensemble), le fils hérite du double de la fille. Dans d'autres cas, la femme peut hériter autant voire plus — par exemple: le frère et la sœur utérins héritent à parts égales (chacun un sixième), et lorsque la mère hérite seule, elle reçoit le tiers alors que le père ne reçoit qu'un sixième en présence d'enfants.",
        answerEn:
          "It depends on the situation. In ta'sib (sons and daughters together), a son inherits double a daughter's share. In other cases, a woman may inherit the same or more — for example: maternal half-brother and half-sister inherit equally (each one sixth), and when the mother inherits alone, she receives one third while the father receives only one sixth in the presence of children.",
      },
      {
        questionAr: "ما هو رسم الإراثة وكيف أحصل عليه؟",
        questionFr: "Qu'est-ce que l'acte d'hérédité et comment l'obtenir?",
        questionEn: "What is the certificate of heirship and how do I obtain it?",
        answerAr:
          "رسم الإراثة وثيقة رسمية تُحررها العدول تُثبت الورثة الشرعيين وحصصهم. للحصول عليه تحتاج: شهادة الوفاة + بطاقات التعريف الوطنية للورثة + شاهدَا عدل يشهدان على هوية الورثة وصلتهم بالمتوفى. التكلفة: حوالي 500-2,000 درهم. المدة: 3-7 أيام في الغالب.",
        answerFr:
          "L'acte d'hérédité est un document officiel établi par les adouls qui identifie les héritiers légaux et leurs parts. Pour l'obtenir: certificat de décès + CNI des héritiers + deux adouls témoins attestant de l'identité des héritiers et de leur lien avec le défunt. Coût: environ 500-2 000 MAD. Délai: généralement 3 à 7 jours.",
        answerEn:
          "The certificate of heirship (Rasm al-Ira'tha) is an official document drawn up by adouls identifying the legal heirs and their shares. To obtain it: death certificate + national ID cards of all heirs + two adoul witnesses attesting to the heirs' identities and relationship with the deceased. Cost: approximately 500–2,000 MAD. Timeframe: usually 3 to 7 days.",
      },
      {
        questionAr: "هل يتغير الإرث بسبب إصلاح مدونة الأسرة 2026؟",
        questionFr: "L'héritage change-t-il avec la réforme de la Moudawana 2026?",
        questionEn: "Will inheritance change with the 2026 Moudawana reform?",
        answerAr:
          "الإصلاح المقترح لمدونة الأسرة 2026 يركز أساساً على مسائل الزواج والطلاق والحضانة والنفقة. أحكام الإرث (الفرائض) مستندة إلى نصوص قرآنية صريحة — وهذا ما جعل المشرّع المغربي يحافظ عليها دون تغيير جوهري. لا يُتوقع تعديل قواعد الحصص المقدرة.",
        answerFr:
          "La réforme proposée de la Moudawana 2026 se concentre principalement sur le mariage, le divorce, la garde et la pension alimentaire. Les règles d'héritage (Farâ'id) sont directement basées sur des textes coraniques explicites — c'est ce qui a conduit le législateur marocain à les maintenir sans modification substantielle. Aucune révision des règles de quotes-parts fixes n'est attendue.",
        answerEn:
          "The proposed 2026 Moudawana reform focuses primarily on marriage, divorce, custody, and alimony. Inheritance rules (Farâ'id) are directly based on explicit Quranic texts — which is why the Moroccan legislator has maintained them without substantial change. No revision of the fixed-share rules is expected.",
      },
    ],
  },
];

export const getGuide = (slug: string): Guide | undefined =>
  GUIDES.find((g) => g.slug === slug);
