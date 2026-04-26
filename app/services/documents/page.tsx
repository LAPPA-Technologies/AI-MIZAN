"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getClientDictionary } from "../../../lib/i18nClient";
import { getFormConfigs, getGuideConfigs } from "../../../lib/forms/formConfigs";
import { categoryLabels, t as tr } from "../../../lib/forms/translations";
import type { DocumentCategory, Locale } from "../../../lib/forms/types";

const categoryIcons: Record<string, string> = {
  family: "👨‍👩‍👧",
  civil: "📜",
  commercial: "💼",
  criminal: "⚖️",
  administrative: "🏛️",
};

const DocumentsPage = () => {
  const dict = getClientDictionary();
  const locale = (dict.language as Locale) || "ar";
  const isRTL = locale === "ar";

  const [activeTab, setActiveTab] = useState<"forms" | "guides">("forms");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");

  const forms = useMemo(() => getFormConfigs(), []);
  const guides = useMemo(() => getGuideConfigs(), []);
  const activeItems = activeTab === "forms" ? forms : guides;

  const categories = useMemo(() => {
    const cats = new Map<DocumentCategory, number>();
    for (const doc of activeItems) {
      cats.set(doc.category, (cats.get(doc.category) ?? 0) + 1);
    }
    return cats;
  }, [activeItems]);

  const filteredDocs = useMemo(() => {
    if (selectedCategory === "all") return activeItems;
    return activeItems.filter((d) => d.category === selectedCategory);
  }, [selectedCategory, activeItems]);

  // Reset category filter when switching tabs
  const switchTab = (tab: "forms" | "guides") => {
    setActiveTab(tab);
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-green-700 transition-colors mb-2"
          >
            <svg className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {dict.navServices || "Services"}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {tr("pageTitle", locale)}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {tr("pageSubtitle", locale)}
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <p>{tr("disclaimer", locale).replace("⚠️ ", "")}</p>
        </div>

        {/* Tab switcher — Category A / Category B */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit mx-auto">
          <button
            type="button"
            onClick={() => switchTab("forms")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "forms"
                ? "bg-white text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              📝 {dict.categoryATitle || "Fillable Forms"}
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">{forms.length}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => switchTab("guides")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "guides"
                ? "bg-white text-green-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              📋 {dict.categoryBTitle || "Procedure Guides"}
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{guides.length}</span>
            </span>
          </button>
        </div>

        {/* Tab description */}
        <div className={`text-center text-sm max-w-xl mx-auto rounded-xl px-4 py-3 ${
          activeTab === "forms"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-blue-50 border border-blue-200 text-blue-800"
        }`}>
          {activeTab === "forms"
            ? (dict.categoryADesc || "Private agreements you can fill, download, and sign between parties. No court filing required.")
            : (dict.categoryBDesc || "Step-by-step guides for procedures that require court, notary, or administration involvement.")}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              selectedCategory === "all"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700"
            }`}
          >
            {tr("filterAll", locale)} ({activeItems.length})
          </button>
          {[...categories.entries()].map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                selectedCategory === cat
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {categoryIcons[cat] ?? "📄"} {categoryLabels[cat]?.[locale] ?? cat} ({count})
            </button>
          ))}
        </div>

        {/* Document cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/services/documents/${doc.slug}`}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-green-300 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl shrink-0">{doc.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors leading-tight">
                    {doc.title[locale]}
                  </h3>
                  <p className="text-xs text-green-700 font-medium mt-0.5">
                    {categoryLabels[doc.category]?.[locale] ?? doc.category}
                  </p>
                </div>
                {/* Badge for form vs guide */}
                <span className={`ms-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  doc.serviceType === "form"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {doc.serviceType === "form"
                    ? (dict.badgeForm || "Form")
                    : (dict.badgeGuide || "Guide")}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {doc.description[locale]}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                  {doc.legalBasis}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 group-hover:text-green-700">
                  {doc.serviceType === "form"
                    ? tr("startForm", locale)
                    : (dict.viewGuide || "View guide")}
                  <svg className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              {doc.serviceType === "form" && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {doc.steps.length} {tr("step", locale)}{locale !== "ar" ? "s" : ""}
                  <span className="mx-1">·</span>
                  <span className="flex gap-1">
                    <span className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-medium">FR</span>
                    <span className="bg-green-50 text-green-700 px-1 py-0.5 rounded font-medium">AR</span>
                    <span className="bg-purple-50 text-purple-600 px-1 py-0.5 rounded font-medium">EN</span>
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">{dict.noResults || "No results found"}</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center space-y-3 py-8 px-4">
          <h3 className="text-lg font-bold text-slate-900">
            {tr("serviceCta", locale)}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {tr("serviceCtaBody", locale)}
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 pb-4">
          <p>© 2026 AI-Mizan · {dict.disclaimer || "Legal information only. Does not replace a licensed lawyer."}</p>
        </footer>
      </div>
    </div>
  );
};

export default DocumentsPage;
