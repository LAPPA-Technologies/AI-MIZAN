"use client";

import { useState, useCallback, lazy, Suspense } from "react";

// Fallback order: requested lang → ar → fr. EN never falls back to FR.
function pick(ar: string, fr: string, en: string, lang: string): string {
  if (lang === "ar") return ar || fr || en;
  if (lang === "fr") return fr || ar || en;
  return en || ar || fr;
}
import Link from "next/link";
import type { Guide } from "../../lib/guidesData";
import type { ArticleRef } from "../../lib/calculatorArticles";
import ArticleModal from "../laws/ArticleModal";

const HeritageCalculator = lazy(
  () => import("../simulators/HeritageCalculator")
);

type Props = {
  guide: Guide;
  lang: string;
  dict: Record<string, string>;
};

const CATEGORY_LABELS: Record<string, { ar: string; fr: string; color: string }> = {
  family:   { ar: "قانون الأسرة",    fr: "Droit de la famille",   color: "green"  },
  labor:    { ar: "قانون الشغل",     fr: "Droit du travail",      color: "blue"   },
  housing:  { ar: "قانون السكن",     fr: "Droit du logement",     color: "amber"  },
  business: { ar: "القانون التجاري", fr: "Droit des affaires",    color: "purple" },
  criminal: { ar: "القانون الجنائي", fr: "Droit pénal",           color: "red"    },
  reform:   { ar: "الإصلاح التشريعي",fr: "Réforme législative",  color: "slate"  },
};

const COLOR_CLASSES: Record<string, { badge: string }> = {
  green:  { badge: "bg-green-100 text-green-800 border-green-200"   },
  blue:   { badge: "bg-blue-100 text-blue-800 border-blue-200"     },
  amber:  { badge: "bg-amber-100 text-amber-800 border-amber-200"  },
  purple: { badge: "bg-purple-100 text-purple-800 border-purple-200"},
  red:    { badge: "bg-red-100 text-red-800 border-red-200"        },
  slate:  { badge: "bg-slate-100 text-slate-800 border-slate-200"  },
};

// Renders a subset of markdown: **bold**, | tables |, plain paragraphs separated by \n\n
function renderContent(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => {
    // Markdown table
    if (block.trim().startsWith("|")) {
      const rows = block
        .trim()
        .split("\n")
        .filter((r) => !/^\|[-\s|]+\|$/.test(r.trim()));
      return (
        <div key={bi} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
            {rows.map((row, ri) => {
              const cells = row
                .split("|")
                .filter((_, i, a) => i > 0 && i < a.length - 1)
                .map((c) => c.trim());
              const isHeader = ri === 0;
              return (
                <tr
                  key={ri}
                  className={isHeader ? "bg-green-700 text-white" : ri % 2 === 0 ? "bg-white" : "bg-green-50/40"}
                >
                  {cells.map((cell, ci) =>
                    isHeader ? (
                      <th key={ci} className="px-3 py-2 text-start font-semibold border border-green-600">
                        {cell}
                      </th>
                    ) : (
                      <td key={ci} className="px-3 py-2 border border-slate-200">
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              );
            })}
          </table>
        </div>
      );
    }

    // Render bold spans inline
    const renderInline = (line: string): React.ReactNode => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });
    };

    // Quranic quote block (lines with "مِن بَعْدِ" or surrounded by ")
    if (block.includes("مِن بَعْدِ") || (block.trim().startsWith('"') && block.trim().endsWith('"'))) {
      return (
        <blockquote key={bi} className="my-4 bg-green-50 border-r-4 border-green-500 px-4 py-3 text-base italic text-slate-700 leading-8 rounded-r-lg">
          {renderInline(block)}
        </blockquote>
      );
    }

    return (
      <p key={bi} className="text-lg text-slate-700 leading-9 mb-3">
        {renderInline(block)}
      </p>
    );
  });
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(
      lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-MA" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return iso;
  }
}

export default function GuideArticle({ guide, lang, dict }: Props) {
  const [openArticle, setOpenArticle] = useState<ArticleRef | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isAr = lang === "ar";
  const isFr = lang === "fr";

  const title = pick(guide.titleAr, guide.titleFr, guide.titleEn, lang);
  const description = pick(guide.descriptionAr, guide.descriptionFr, guide.descriptionEn, lang);

  const cat = CATEGORY_LABELS[guide.category] ?? CATEGORY_LABELS.family;
  const catLabel = pick(cat.ar, cat.fr, cat.ar, lang);
  const colors = COLOR_CLASSES[cat.color] ?? COLOR_CLASSES.green;

  // keyPoints only has AR and FR; EN falls back to AR
  const keyPoints = lang === "fr" ? guide.keyPoints.fr : guide.keyPoints.ar;

  const openArticleRef = useCallback(
    (number: string, code: string, labelAr: string) => {
      setOpenArticle({
        articleNumber: number,
        code,
        descAr: labelAr,
        descFr: labelAr,
        descEn: labelAr,
        inDb: true,
      });
    },
    []
  );

  const closeModal = useCallback(() => setOpenArticle(null), []);

  const waText = encodeURIComponent(
    isAr
      ? `📋 ${guide.titleAr}\n\n${keyPoints.map((p) => `• ${p}`).join("\n")}\n\n🔗 ${typeof window !== "undefined" ? window.location.href : ""}`
      : `📋 ${guide.titleFr}\n\n${keyPoints.map((p) => `• ${p}`).join("\n")}`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

      {/* ── ZONE 1: Header ── */}
      <header className="space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-green-700 transition-colors">
            {isAr ? "الرئيسية" : "Accueil"}
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/guides" className="hover:text-green-700 transition-colors">
            {isAr ? "الأدلة القانونية" : "Guides juridiques"}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 truncate max-w-[180px]">{title}</span>
        </nav>

        {/* Category + free badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${colors.badge}`}>
            {catLabel}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {isAr ? "مجاني ١٠٠٪" : "100% Gratuit"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
          {title}
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 leading-8">{description}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isAr ? `${guide.readingTimeMinutes} دقائق قراءة` : `${guide.readingTimeMinutes} min de lecture`}
          </span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(guide.updatedAt, lang)}
          </span>
        </div>

        {/* Share — WhatsApp mobile only */}
        <div className="md:hidden pt-1">
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#20b858] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </header>

      {/* ── ZONE 2: Key points box ── */}
      <section className="rounded-xl border-2 border-green-300 bg-green-50 p-5 space-y-3">
        <h2 className="text-base font-bold text-green-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isAr ? "النقاط الأساسية" : "Points essentiels"}
        </h2>
        <ul className="space-y-2.5">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-6">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* ── ZONE 3: Guide sections ── */}
      <div className="space-y-10">
        {guide.sections.map((section) => {
          const sectionTitle = pick(section.titleAr, section.titleFr, section.titleEn, lang);
          const sectionContent = pick(section.contentAr, section.contentFr, section.contentEn, lang);

          return (
            <section key={section.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                {sectionTitle}
              </h2>
              <div className="prose-none">{renderContent(sectionContent)}</div>

              {/* Article refs */}
              {section.articleRefs && section.articleRefs.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {section.articleRefs.map((ref) => (
                    <button
                      key={`${ref.code}-${ref.number}`}
                      onClick={() => openArticleRef(ref.number, ref.code, ref.labelAr)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isAr ? `المادة ${ref.number}` : `Art. ${ref.number}`}
                      {ref.labelAr && <span className="text-green-600">— {isAr ? ref.labelAr : ref.labelAr}</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── ZONE 4: Embedded calculator ── */}
      {guide.relatedCalculator === "heritage" && (
        <section className="space-y-4 rounded-2xl border border-green-100 bg-green-50/30 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isAr ? "جرّب الحاسبة مباشرةً" : "Essayez la calculatrice"}
              </h2>
              <p className="text-sm text-slate-500">
                {isAr ? "احسب حصصك الفعلية خلال ثوانٍ" : "Calculez vos parts réelles en quelques secondes"}
              </p>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-green-600" />
                <span className="text-sm">{isAr ? "جارٍ التحميل..." : "Chargement..."}</span>
              </div>
            }
          >
            <HeritageCalculator dict={dict} lang={lang} />
          </Suspense>
        </section>
      )}

      {/* ── ZONE 5: FAQ ── */}
      {guide.faqs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {isAr ? "أسئلة شائعة" : "Questions fréquentes"}
          </h2>
          <div className="space-y-2">
            {guide.faqs.map((faq, i) => {
              const q = pick(faq.questionAr, faq.questionFr, faq.questionAr, lang);
              const a = pick(faq.answerAr, faq.answerFr, faq.answerAr, lang);
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span itemProp="name">{q}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div
                      className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-base text-slate-700 leading-8"
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <span itemProp="text">{a}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ZONE 6: Lawyer CTA ── */}
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-green-50/30 p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">
            {isAr ? "هل تحتاج مساعدة قانونية؟" : "Besoin d'aide juridique ?"}
          </h2>
          <p className="text-sm text-slate-600 max-w-sm mx-auto leading-6">
            {isAr
              ? "يُمكن لمحامٍ متخصص مساعدتك في تطبيق هذه الأحكام على وضعك الخاص وتجنّب النزاعات."
              : "Un avocat spécialisé peut vous aider à appliquer ces règles à votre situation et éviter les conflits."}
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-green-700 transition-colors"
        >
          {isAr ? "تواصل مع محامٍ متخصص" : "Contacter un avocat spécialisé"}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

      {/* ── ZONE 7: Related guides ── */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-700">
          {isAr ? "أدلة ذات صلة" : "Guides connexes"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/guides"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 text-lg">
              👨‍👩‍👧
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {isAr ? "دليل قانون الأسرة" : "Guide droit de la famille"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {isAr ? "الطلاق، الحضانة، النفقة" : "Divorce, garde, pension alimentaire"}
              </p>
            </div>
          </Link>
          <Link
            href="/simulateurs"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-green-300 hover:shadow-sm transition-all"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-lg">
              🧮
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {isAr ? "جميع الحاسبات القانونية" : "Tous les simulateurs juridiques"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {isAr ? "الراتب، الفصل، الكراء، الموثق" : "Salaire, licenciement, loyer, notaire"}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Article modal */}
      <ArticleModal
        articleRef={openArticle}
        lang={lang}
        dict={dict}
        onClose={closeModal}
      />
    </div>
  );
}
