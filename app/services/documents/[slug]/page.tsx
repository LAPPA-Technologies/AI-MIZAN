"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getClientDictionary } from "../../../../lib/i18nClient";
import { getDocumentFormConfig } from "../../../../lib/forms/formConfigs";
import { categoryLabels, t as tr } from "../../../../lib/forms/translations";
import { generateRefNumber } from "../../../../lib/forms/documentTemplates";
import FormBuilder from "../../../../components/forms/FormBuilder";
import DocumentPreview from "../../../../components/forms/DocumentPreview";
import { generatePDF, downloadAsTxt, shareViaWhatsApp } from "../../../../components/forms/PDFGenerator";
import type { Locale } from "../../../../lib/forms/types";

/* ─── History item type ──────────────────────────────────────── */
interface HistoryItem {
  slug: string;
  ref: string;
  title: string;
  date: string;
  locale: Locale;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function DocumentFormPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const dict = getClientDictionary();
  const locale = (dict.language as Locale) || "ar";
  const isRTL = locale === "ar";

  const config = useMemo(() => getDocumentFormConfig(slug), [slug]);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [refNumber] = useState(() => generateRefNumber());
  const [previewLang, setPreviewLang] = useState<Locale>(locale);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // ── Not found ──
  if (!config) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center space-y-4">
          <p className="text-6xl">📄</p>
          <h1 className="text-xl font-bold text-slate-900">Document not found</h1>
          <Link href="/services/documents" className="text-green-600 hover:text-green-700 text-sm font-medium">
            ← {tr("backToDocuments", locale)}
          </Link>
        </div>
      </div>
    );
  }

  // ── Complete handler ──
  const handleComplete = useCallback(async () => {
    setGenerated(true);
  }, []);

  // ── Generate PDF ──
  const handleGeneratePDF = useCallback(async () => {
    setGenerating(true);
    try {
      await generatePDF(config.id, config.title[previewLang], previewLang, formData, refNumber);
      // Save to history
      saveToHistory({ slug: config.slug, ref: refNumber, title: config.title[locale], date: new Date().toISOString(), locale });
    } catch (e) {
      console.error("PDF generation error:", e);
    } finally {
      setGenerating(false);
    }
  }, [config, previewLang, formData, refNumber, locale]);

  // ── Download TXT ──
  const handleDownloadTxt = useCallback(() => {
    downloadAsTxt(config.id, previewLang, formData, refNumber);
    saveToHistory({ slug: config.slug, ref: refNumber, title: config.title[locale], date: new Date().toISOString(), locale });
  }, [config, previewLang, formData, refNumber, locale]);

  // ── Share WhatsApp ──
  const handleShareWhatsApp = useCallback(() => {
    shareViaWhatsApp(config.id, config.title[previewLang], previewLang, formData, refNumber);
  }, [config, previewLang, formData, refNumber]);

  // ── Clear form ──
  const handleClear = useCallback(() => {
    setFormData({});
    setGenerated(false);
    try { localStorage.removeItem(`mizan-draft-${config.slug}`); } catch {}
  }, [config.slug]);

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/services/documents" className="hover:text-green-700 transition-colors">
            {tr("backToDocuments", locale)}
          </Link>
          <svg className={`w-3.5 h-3.5 ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 font-medium">{config.title[locale]}</span>
        </div>

        {/* ── Title bar ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">{config.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900">{config.title[locale]}</h1>
              <p className="text-xs text-slate-500">{config.description[locale]}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                {config.legalBasis}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {categoryLabels[config.category]?.[locale] ?? config.category}
              </span>
            </div>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 flex items-start gap-2 mb-6">
          <span className="shrink-0">⚠️</span>
          <p>{tr("disclaimer", locale).replace("⚠️ ", "")}</p>
        </div>

        {/* ── Guide banner (only for guide-type documents) ── */}
        {config.serviceType === "guide" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-3 mb-6">
            <span className="text-lg shrink-0">📋</span>
            <div>
              <p className="font-semibold mb-1">{dict.guideBannerTitle || "Procedure Guide"}</p>
              <p className="text-xs">{dict.guideBannerDesc || "This procedure requires court, notary, or administration filing. Use this form to prepare your information, but the final document must be submitted through official channels. This is an informational guide only."}</p>
            </div>
          </div>
        )}

        {/* ── Main layout: Form + Preview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Form */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 min-h-[500px]">
            {!generated ? (
              <FormBuilder
                config={config}
                locale={locale}
                data={formData}
                onChange={setFormData}
                onComplete={handleComplete}
              />
            ) : (
              /* ── Post-generation actions ── */
              <div className="flex flex-col items-center justify-center h-full space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{tr("documentGenerated", locale)}</h3>
                <p className="text-xs text-slate-500">{refNumber}</p>

                {/* Action buttons */}
                <div className="space-y-3 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={handleGeneratePDF}
                    disabled={generating}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 shadow-md shadow-green-200 transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {generating ? tr("generating", locale) : tr("downloadPdf", locale)}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {tr("downloadTxt", locale)}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    {tr("shareWhatsApp", locale)}
                  </button>
                </div>

                {/* Mobile-only preview shown after generation, before downloads */}
                <div className="w-full block lg:hidden mt-6">
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <DocumentPreview
                      config={config}
                      locale={locale}
                      data={formData}
                      refNumber={refNumber}
                      previewLang={previewLang}
                      onChangeLang={setPreviewLang}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    {tr("clearForm", locale)}
                  </button>
                  <Link
                    href="/services/documents"
                    className="text-xs text-green-600 hover:text-green-700 transition-colors"
                  >
                    {tr("backToDocuments", locale)}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Preview (hidden on phones) */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <DocumentPreview
              config={config}
              locale={locale}
              data={formData}
              refNumber={refNumber}
              previewLang={previewLang}
              onChangeLang={setPreviewLang}
            />
          </div>
        </div>

        {/* Mobile preview removed to prevent preview on phones */}
      </div>
    </div>
  );
}

/* ─── History helpers ────────────────────────────────────────── */
function saveToHistory(item: HistoryItem) {
  try {
    const key = "mizan-doc-history";
    const raw = localStorage.getItem(key);
    const arr: HistoryItem[] = raw ? JSON.parse(raw) : [];
    // Deduplicate by ref
    const filtered = arr.filter((h) => h.ref !== item.ref);
    filtered.unshift(item);
    // Keep last 10
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
  } catch {}
}
