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
    labelFr?: string;
    labelEn?: string;
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
  relatedGuides?: string[];
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
  {
    slug: "droits-licenciement-maroc",
    titleAr: "حقوقك عند الفصل التعسفي في المغرب",
    titleFr: "Droits au licenciement au Maroc",
    titleEn: "Your Rights When Dismissed in Morocco",
    descriptionAr: "دليل شامل لحقوقك عند الفصل التعسفي في المغرب — التعويضات والإجراءات والمواعيد القانونية",
    descriptionFr: "Guide complet de vos droits en cas de licenciement abusif au Maroc — indemnités, procédures et délais légaux",
    descriptionEn: "Complete guide to your rights when unfairly dismissed in Morocco — compensation, procedures and legal deadlines",
    category: "labor",
    relatedCalculator: "licenciement",
    relatedLawCode: "labor_code",
    publishedAt: "2026-04-29",
    updatedAt: "2026-04-29",
    readingTimeMinutes: 7,
    relatedGuides: ["calcul-heritage-maroc"],
    keyPoints: {
      ar: [
        "الفصل التعسفي يخوّلك التعويض وفق مدونة الشغل المادة 41",
        "التعويض = راتب × سنوات الأقدمية × معامل قانوني",
        "لديك 90 يوماً لرفع شكوى لدى مفتش الشغل — لا تفوّت هذا الأجل",
        "يحق لك الاحتفاظ بشهادة العمل وتسوية جميع الحقوق",
        "الفصل بدون سبب مشروع = فصل تعسفي حتى لو أُعطيت مهلة إشعار",
      ],
      fr: [
        "Le licenciement abusif ouvre droit à indemnisation (Art. 41 CT)",
        "Indemnité = salaire × années d'ancienneté × coefficient légal",
        "Vous avez 90 jours pour saisir l'Inspecteur du Travail",
        "Droit au certificat de travail et solde de tout compte complet",
        "Licenciement sans motif valable = abusif même avec préavis respecté",
      ],
      en: [
        "Unfair dismissal entitles you to compensation under Labor Code Art. 41",
        "Compensation = salary × years of service × legal coefficient",
        "You have 90 days to file a complaint with the Labor Inspector",
        "You have the right to a work certificate and full final settlement",
        "Dismissal without valid reason = unfair dismissal even with notice",
      ],
    },
    sections: [
      {
        id: "definition",
        titleAr: "ما هو الفصل التعسفي؟",
        titleFr: "Qu'est-ce que le licenciement abusif?",
        titleEn: "What is Unfair Dismissal?",
        contentAr: `الفصل التعسفي هو إنهاء عقد العمل من طرف صاحب العمل دون سبب مشروع ومقبول قانوناً، أو دون احترام الإجراءات المنصوص عليها في مدونة الشغل المغربية.

وفق المادة 35 من مدونة الشغل، لا يمكن لصاحب العمل فصل أجير إلا لسبب وجيه ومشروع يتعلق بسلوكه أو أدائه المهني. عبء إثبات هذا السبب يقع على عاتق صاحب العمل وليس على الأجير.

**أسباب الفصل غير المشروع:**
- الانتماء النقابي أو ممارسة النشاط النقابي
- الحمل أو الإجازة الأمومية
- المرض أو الإصابة في العمل
- رفع شكوى ضد صاحب العمل (التبليغ عن مخالفات)
- الجنس أو الدين أو الأصل

**الفرق بين الفصل التأديبي والتعسفي:**
الفصل التأديبي مشروع إذا ارتكب الأجير خطأً جسيماً موثقاً (كالسرقة أو الغياب المتكرر). أما إذا لم يُثبت صاحب العمل الخطأ، أو كانت العقوبة غير متناسبة، فالفصل تعسفي.

مثال واقعي: إلا طردك صاحب الشغل بحجة "ضرورة اقتصادية" بدون وثائق تثبت هذه الضرورة، هذا فصل تعسفي ومن حقك المطالبة بالتعويض.`,
        contentFr: `Le licenciement abusif est la rupture du contrat de travail par l'employeur sans motif légitime et légalement acceptable, ou sans respecter les procédures prévues par le Code du Travail marocain.

Selon l'article 35 du Code du Travail, l'employeur ne peut licencier un salarié que pour un motif valable lié à son comportement ou à ses performances. La charge de la preuve incombe à l'employeur, pas au salarié.

**Motifs de licenciement illégaux:**
- Appartenance syndicale ou activité syndicale
- Grossesse ou congé maternité
- Maladie ou accident du travail
- Dépôt de plainte contre l'employeur
- Sexe, religion ou origine

**Différence entre licenciement disciplinaire et abusif:**
Le licenciement disciplinaire est légitime si le salarié a commis une faute grave documentée. Sans preuve ou avec une sanction disproportionnée, il devient abusif.`,
        contentEn: `Unfair dismissal occurs when an employer terminates an employment contract without a legitimate legal reason, or without following the procedures set out in Morocco's Labor Code.

Under Article 35 of the Labor Code, an employer can only dismiss an employee for a valid reason related to their conduct or professional performance. The burden of proof lies with the employer, not the employee.

**Illegal reasons for dismissal:**
- Trade union membership or activity
- Pregnancy or maternity leave
- Illness or workplace injury
- Filing a complaint against the employer
- Gender, religion or origin

**Disciplinary vs unfair dismissal:**
Disciplinary dismissal is legitimate if the employee committed a documented serious fault. Without proof, or with a disproportionate sanction, it becomes unfair dismissal.`,
        articleRefs: [
          { number: "35", code: "labor_code", labelAr: "أسباب الفصل المشروع", labelFr: "Motifs légaux de licenciement", labelEn: "Legal grounds for dismissal" },
          { number: "36", code: "labor_code", labelAr: "إجراءات الفصل التأديبي", labelFr: "Procédure disciplinaire", labelEn: "Disciplinary procedure" },
          { number: "37", code: "labor_code", labelAr: "حق الأجير في الدفاع عن نفسه", labelFr: "Droit de défense du salarié", labelEn: "Employee's right of defense" },
        ],
      },
      {
        id: "rights",
        titleAr: "حقوقك القانونية عند الفصل",
        titleFr: "Vos droits légaux lors du licenciement",
        titleEn: "Your Legal Rights Upon Dismissal",
        contentAr: `عند فصلك تعسفياً، يكفل لك القانون المغربي جملة من الحقوق التي لا يمكن التنازل عنها:

**1. تعويض الفصل (المادة 52-53)**
يُحسب التعويض بناءً على الراتب الإجمالي وسنوات الأقدمية. لا يمكن لصاحب العمل إسقاط هذا الحق حتى لو وقّعت على وثيقة تنازل تحت الضغط.

**2. أجل الإشعار (المادة 43-45)**
يحق لك الاستفادة من أجل إشعار كافٍ قبل مغادرة العمل، أو تعويض مالي يعادله إذا طُلب منك المغادرة فوراً.

**3. شهادة العمل (المادة 72)**
حق مكفول بالقانون. يجب أن تتضمن: تاريخ الالتحاق، تاريخ المغادرة، والمنصب الوظيفي. لا يحق لصاحب العمل الامتناع عن تسليمها.

**4. تسوية الحقوق الكاملة**
تشمل: الأجر المتبقي، أيام الراحة غير المستهلكة، المنح والعلاوات المستحقة.

**5. إشكالية التنازل تحت الإكراه**
إذا أُجبرت على التوقيع على وثيقة تنازل عن حقوقك، فهذا التوقيع قابل للطعن أمام القضاء إذا ثبت الإكراه.`,
        contentFr: `En cas de licenciement abusif, la loi marocaine vous garantit plusieurs droits auxquels vous ne pouvez pas renoncer:

**1. Indemnité de licenciement (Art. 52-53)**
Calculée sur le salaire brut et les années d'ancienneté. L'employeur ne peut pas supprimer ce droit même si vous avez signé une renonciation sous pression.

**2. Préavis (Art. 43-45)**
Droit à un préavis suffisant ou à une indemnité compensatrice si départ immédiat requis.

**3. Certificat de travail (Art. 72)**
Droit légal obligatoire incluant: date d'embauche, date de départ, poste occupé.

**4. Solde de tout compte complet**
Salaire restant, congés non pris, primes et allocations dues.`,
        contentEn: `Upon unfair dismissal, Moroccan law guarantees you several rights that cannot be waived:

**1. Severance compensation (Art. 52-53)**
Calculated based on gross salary and years of service. The employer cannot remove this right even if you signed a waiver under pressure.

**2. Notice period (Art. 43-45)**
Right to adequate notice or financial compensation if immediate departure is required.

**3. Work certificate (Art. 72)**
A legal right that must include: start date, end date, and job title. The employer cannot refuse to provide it.

**4. Full final settlement**
Includes remaining salary, unused leave days, and any outstanding bonuses.`,
        articleRefs: [
          { number: "41", code: "labor_code", labelAr: "التعويض عن الفصل التعسفي", labelFr: "Indemnité de licenciement abusif", labelEn: "Unfair dismissal compensation" },
          { number: "52", code: "labor_code", labelAr: "حساب التعويض", labelFr: "Calcul de l'indemnité", labelEn: "Compensation calculation" },
          { number: "53", code: "labor_code", labelAr: "الأقدمية وأثرها", labelFr: "Ancienneté et son effet", labelEn: "Seniority and its effect" },
        ],
      },
      {
        id: "calculation",
        titleAr: "كيف تُحسب التعويضات؟",
        titleFr: "Comment calculer les indemnités?",
        titleEn: "How is Compensation Calculated?",
        contentAr: `يُحسب تعويض الفصل التعسفي وفق معادلة قانونية محددة في المادتين 52 و53 من مدونة الشغل.

**المعادلة الأساسية:**
- من 1 إلى 5 سنوات: 96 ساعة أجر لكل سنة
- من 6 إلى 10 سنوات: 144 ساعة أجر لكل سنة  
- من 11 إلى 15 سنة: 192 ساعة أجر لكل سنة
- أكثر من 15 سنة: 240 ساعة أجر لكل سنة

**مثال عملي:**
أجير خدم 8 سنوات براتب إجمالي 8,000 درهم:

- الراتب الساعي: 8,000 ÷ 191 = 41.88 درهم/ساعة
- سنوات 1-5: 5 × 96 × 41.88 = **20,105 درهم**
- سنوات 6-8: 3 × 144 × 41.88 = **18,092 درهم**
- **إجمالي التعويض: 38,197 درهم**

يُضاف إلى ذلك: تعويض أجل الإشعار (شهر إلى 3 أشهر حسب الفئة المهنية).

احسب تعويضك الدقيق باستخدام حاسبتنا المجانية:`,
        contentFr: `L'indemnité de licenciement se calcule selon une formule légale définie aux articles 52 et 53 du Code du Travail.

**Formule de base:**
- De 1 à 5 ans: 96 heures de salaire par année
- De 6 à 10 ans: 144 heures par année
- De 11 à 15 ans: 192 heures par année
- Plus de 15 ans: 240 heures par année

**Exemple pratique:**
Salarié ayant travaillé 8 ans avec un salaire brut de 8 000 MAD:
- Taux horaire: 8 000 ÷ 191 = 41,88 MAD/heure
- Années 1-5: 5 × 96 × 41,88 = **20 105 MAD**
- Années 6-8: 3 × 144 × 41,88 = **18 092 MAD**
- **Total: 38 197 MAD**`,
        contentEn: `Severance compensation is calculated according to a legal formula defined in Articles 52 and 53 of the Labor Code.

**Basic formula:**
- Years 1-5: 96 hours of salary per year
- Years 6-10: 144 hours per year
- Years 11-15: 192 hours per year
- Over 15 years: 240 hours per year

**Practical example:**
Employee with 8 years of service, gross salary 8,000 MAD:
- Hourly rate: 8,000 ÷ 191 = 41.88 MAD/hour
- Years 1-5: 5 × 96 × 41.88 = **20,105 MAD**
- Years 6-8: 3 × 144 × 41.88 = **18,092 MAD**
- **Total compensation: 38,197 MAD**

Calculate your exact compensation using our free calculator:`,
        articleRefs: [
          { number: "52", code: "labor_code", labelAr: "حساب التعويض", labelFr: "Calcul de l'indemnité", labelEn: "Compensation calculation" },
          { number: "53", code: "labor_code", labelAr: "الأقدمية", labelFr: "Ancienneté", labelEn: "Seniority" },
        ],
      },
      {
        id: "procedure",
        titleAr: "خطوات المطالبة بحقوقك",
        titleFr: "Étapes pour faire valoir vos droits",
        titleEn: "Steps to Claim Your Rights",
        contentAr: `إذا تعرضت للفصل التعسفي، اتبع هذه الخطوات بالترتيب:

**الخطوة 1 — اجمع الوثائق فوراً**
قبل أي شيء: احتفظ بنسخ من عقد العمل، كشوف الراتب، أي رسائل أو إشعارات من صاحب العمل، وسجل كل المحادثات الهاتفية أو الإلكترونية ذات الصلة.

**الخطوة 2 — تقدم بشكوى لمفتش الشغل (90 يوماً)**
هذا الأجل إلزامي ولا يقبل التمديد. توجه إلى مفتش الشغل في المنطقة التي تعمل فيها. الشكوى مجانية. سيستدعي المفتش صاحب العمل لجلسة استماع.

**الخطوة 3 — مرحلة الصلح**
يحاول مفتش الشغل التوفيق بين الطرفين. إذا قبل صاحب العمل التعويض العادل، انتهت القضية. إذا رفض، يحرر المفتش محضراً بعجز الصلح.

**الخطوة 4 — محكمة الشغل**
بناءً على محضر عجز الصلح، ترفع دعوى أمام محكمة الشغل. لا تشترط المحكمة وجود محامٍ في المرحلة الأولى.

**الخطوة 5 — الاستئناف**
إذا لم يُنصفك الحكم الابتدائي، يمكن الطعن في محكمة الاستئناف خلال 30 يوماً.`,
        contentFr: `En cas de licenciement abusif, suivez ces étapes dans l'ordre:

**Étape 1 — Rassemblez les documents immédiatement**
Conservez: contrat de travail, bulletins de paie, courriers de l'employeur, échanges écrits pertinents.

**Étape 2 — Saisir l'Inspecteur du Travail (90 jours)**
Délai impératif, non extensible. Rendez-vous à l'Inspection du Travail de votre zone. Gratuit. L'inspecteur convoquera l'employeur.

**Étape 3 — Conciliation**
L'inspecteur tente de concilier les parties. Si accord: affaire réglée. Sinon: procès-verbal de non-conciliation.

**Étape 4 — Tribunal du Travail**
Sur base du PV de non-conciliation, saisir le Tribunal. Pas d'avocat obligatoire en première instance.

**Étape 5 — Appel**
Si le jugement est défavorable: appel dans les 30 jours.`,
        contentEn: `If you face unfair dismissal, follow these steps in order:

**Step 1 — Gather documents immediately**
Keep copies of: employment contract, pay slips, employer letters, any relevant written communications.

**Step 2 — File complaint with Labor Inspector (90 days)**
This deadline is mandatory and cannot be extended. Go to the Labor Inspection office in your work area. Free of charge. The inspector will summon your employer.

**Step 3 — Conciliation attempt**
The inspector tries to reconcile both parties. If the employer agrees to fair compensation: case closed. If not: a non-conciliation report is issued.

**Step 4 — Labor Court**
Based on the non-conciliation report, file a case at the Labor Court. No lawyer required at first instance.

**Step 5 — Appeal**
If the judgment is unfavorable: appeal within 30 days.`,
        articleRefs: [
          { number: "532", code: "labor_code", labelAr: "الشكوى لدى مفتش الشغل", labelFr: "Plainte auprès de l'Inspecteur", labelEn: "Labor Inspector complaint" },
          { number: "533", code: "labor_code", labelAr: "مسطرة الصلح", labelFr: "Procédure de conciliation", labelEn: "Conciliation procedure" },
        ],
      },
      {
        id: "lawyer",
        titleAr: "متى تحتاج محامياً؟",
        titleFr: "Quand avez-vous besoin d'un avocat?",
        titleEn: "When Do You Need a Lawyer?",
        contentAr: `ليس كل قضية فصل تعسفي تحتاج محامياً. إليك الدليل العملي:

**يمكنك التصرف بنفسك إذا:**
- الفصل واضح وموثق (لا خلاف على الوقائع)
- التعويض المطلوب في حدود معقولة
- صاحب العمل مستعد للتفاوض
- القضية أمام مفتش الشغل فقط

**تحتاج محامياً إذا:**
- الوقائع متنازع عليها وصاحب العمل ينكر الفصل
- مبلغ التعويض كبير (أكثر من 50,000 درهم)
- يتعلق الأمر بفصل جماعي أو إعادة هيكلة
- ادعاءات تمييز (جنس، دين، نقابة)
- تأخرت في رفع الشكوى وتحتاج طعناً في التقادم

**تكلفة المحامي في قضايا الشغل بالمغرب:**
- استشارة أولى: 300-800 درهم
- تمثيل أمام المفتش والمحكمة: 3,000-10,000 درهم حسب تعقيد القضية
- بعض المحامين يقبلون الدفع بعد كسب القضية (نسبة من التعويض)`,
        contentFr: `Toutes les affaires de licenciement abusif ne nécessitent pas un avocat:

**Vous pouvez agir seul si:**
- Les faits sont clairs et documentés
- L'indemnité demandée est raisonnable
- L'employeur est prêt à négocier

**Vous avez besoin d'un avocat si:**
- Les faits sont contestés
- Le montant est important (plus de 50 000 MAD)
- Licenciement collectif ou restructuration
- Discrimination alléguée

**Honoraires en droit du travail au Maroc:**
- Consultation: 300-800 MAD
- Représentation complète: 3 000-10 000 MAD`,
        contentEn: `Not every unfair dismissal case requires a lawyer:

**You can act alone if:**
- The dismissal is clear and documented
- The compensation sought is reasonable
- The employer is willing to negotiate

**You need a lawyer if:**
- Facts are disputed by the employer
- Large amounts involved (over 50,000 MAD)
- Collective dismissal or restructuring
- Discrimination claims

**Lawyer fees for labor cases in Morocco:**
- Initial consultation: 300-800 MAD
- Full representation: 3,000-10,000 MAD`,
      },
    ],
    faqs: [
      {
        questionAr: "هل يحق لصاحب العمل فصلي بدون سبب؟",
        questionFr: "L'employeur peut-il me licencier sans raison?",
        questionEn: "Can my employer dismiss me without reason?",
        answerAr: "لا. يجب على صاحب العمل إثبات سبب مشروع للفصل وفق المادة 35 من مدونة الشغل. عبء الإثبات عليه هو وليس عليك. إذا عجز عن الإثبات اعتُبر الفصل تعسفياً ويستحق التعويض الكامل.",
        answerFr: "Non. L'employeur doit prouver un motif valable selon l'Art. 35 CT. La charge de la preuve lui incombe. Sans preuve, le licenciement est abusif et ouvre droit à indemnisation.",
        answerEn: "No. The employer must prove a valid reason under Article 35 of the Labor Code. The burden of proof lies with the employer. Without proof, the dismissal is unfair and entitles you to full compensation.",
      },
      {
        questionAr: "كم مدة التقادم لرفع دعوى الفصل التعسفي؟",
        questionFr: "Quel est le délai de prescription?",
        questionEn: "What is the statute of limitations?",
        answerAr: "90 يوماً للشكوى لدى مفتش الشغل من تاريخ الفصل — هذا الأجل إلزامي لا يقبل التمديد. أما رفع الدعوى أمام محكمة الشغل مباشرة فالتقادم سنتان.",
        answerFr: "90 jours pour saisir l'Inspecteur du Travail — délai impératif. Pour saisir directement le Tribunal du Travail: 2 ans.",
        answerEn: "90 days to file with the Labor Inspector from dismissal date — mandatory, cannot be extended. To file directly with the Labor Court: 2 years.",
      },
      {
        questionAr: "هل أستحق تعويضاً إذا استقلت أنا؟",
        questionFr: "Ai-je droit à une indemnité si je démissionne?",
        questionEn: "Am I entitled to compensation if I resign?",
        answerAr: "في الأصل لا. لكن إذا كنت مضطراً للاستقالة بسبب ظروف أوجدها صاحب العمل — كعدم دفع الراتب أو التحرش أو تغيير الوظيفة قسراً — فهذا ما يُسمى الإكراه على الاستقالة ويعطيك نفس حقوق الفصل التعسفي.",
        answerFr: "En principe non. Mais si vous êtes contraint de démissionner à cause de l'employeur (impayés, harcèlement, modification forcée du poste), c'est une démission forcée assimilée au licenciement abusif.",
        answerEn: "In principle no. But if you are forced to resign due to circumstances created by the employer — unpaid salary, harassment, forced job change — this is constructive dismissal and gives you the same rights as unfair dismissal.",
      },
      {
        questionAr: "ماذا أفعل إذا رفض صاحب العمل إعطائي شهادة العمل؟",
        questionFr: "Que faire si l'employeur refuse le certificat de travail?",
        questionEn: "What if my employer refuses to give me a work certificate?",
        answerAr: "شهادة العمل حق قانوني مكفول بالمادة 72 من مدونة الشغل. إذا رفض صاحب العمل: 1) تقدم بشكوى لمفتش الشغل 2) ارفع دعوى أمام محكمة الشغل. صاحب العمل يتعرض لغرامة مالية بين 300 و500 درهم عن كل رفض.",
        answerFr: "Certificat de travail garanti par Art. 72 CT. En cas de refus: saisir l'Inspecteur du Travail ou le Tribunal. Amende de 300 à 500 MAD pour l'employeur récalcitrant.",
        answerEn: "The work certificate is a legal right under Article 72 of the Labor Code. If refused: file with the Labor Inspector or Labor Court. The employer faces a fine of 300-500 MAD per refusal.",
      },
    ],
  },
];

export const getGuide = (slug: string): Guide | undefined =>
  GUIDES.find((g) => g.slug === slug);
