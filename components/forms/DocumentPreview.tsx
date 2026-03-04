"use client";

import { useMemo } from "react";
import type { DocumentFormConfig, Locale } from "../../lib/forms/types";
import { renderDocumentText, generateRefNumber } from "../../lib/forms/documentTemplates";
import { t as tr } from "../../lib/forms/translations";

/* ─── Props ─────────────────────────────────────────────────── */
interface DocumentPreviewProps {
  config: DocumentFormConfig;
  locale: Locale;
  data: Record<string, unknown>;
  refNumber: string;
  previewLang: Locale;
  onChangeLang: (lang: Locale) => void;
}

/* ─── Component ─────────────────────────────────────────────── */
export default function DocumentPreview({
  config,
  locale,
  data,
  refNumber,
  previewLang,
  onChangeLang,
}: DocumentPreviewProps) {
  const isRTL = locale === "ar";
  const isPreviewRTL = previewLang === "ar";

  const text = useMemo(
    () => renderDocumentText(config.id, previewLang, data, refNumber),
    [config.id, previewLang, data, refNumber],
  );

  // Simple parser to transform plain text into structured elements for a
  // more professional, legal-style rendering that mirrors the PDF layout.
  const renderStructured = (raw: string) => {
    const lines = raw.split("\n");
    const nodes: any[] = [];
    let paragraph: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length > 0) {
        nodes.push({ type: "p", text: paragraph.join(" ") });
        paragraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushParagraph();
        continue;
      }

      if (line === "---") {
        flushParagraph();
        nodes.push({ type: "hr" });
        continue;
      }

      const isHeading = line === line.toUpperCase() && line.length > 3 && !/^\d/.test(line);
      if (isHeading) {
        flushParagraph();
        nodes.push({ type: "h", text: line });
        continue;
      }

      // Lines starting with Ref/Date (any language) are rendered as meta
      if (/^(Ref|Date|المرجع|التاريخ)[:\s]/i.test(line)) {
        flushParagraph();
        nodes.push({ type: "meta", text: line });
        continue;
      }

      paragraph.push(line);
    }
    flushParagraph();
    return nodes;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {tr("preview", locale)}
        </h3>

        {/* Language tabs */}
        <div className="flex gap-1">
          {(["ar", "fr", "en"] as Locale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onChangeLang(lang)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                previewLang === lang
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {lang === "ar" ? "عربي" : lang === "fr" ? "FR" : "EN"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live badge ── */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[11px] text-green-600 font-medium">{tr("livePreview", locale)}</span>
      </div>

      {/* ── Document paper ── */}
      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white shadow-inner relative">
        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-semibold text-slate-200/70 rotate-12 opacity-60">AL-MIZAN</span>
        </div>

        <div className="p-6 min-h-[420px] relative bg-white" dir={isPreviewRTL ? "rtl" : "ltr"}>
          {/* Top accent bar */}
          <div className="w-full h-1.5 bg-green-600 mb-4 rounded-sm" />

          {/* Title block */}
          <div className="text-center mb-5">
            <div className="text-xs text-slate-500">{config.title[previewLang]}</div>
            <div className="text-lg font-semibold text-slate-800 mt-1">{config.title[previewLang]}</div>
            <div className="text-[11px] text-slate-400 mt-1">{refNumber}</div>
          </div>

          {/* Structured content */}
          <div className="prose prose-sm max-w-none text-slate-700">
            {renderStructured(text).map((node, idx) => {
              if (node.type === "h") return (
                <h3 key={idx} className="text-sm font-semibold text-slate-800 mt-4 mb-1">{node.text}</h3>
              );
              if (node.type === "hr") return <hr key={idx} className="border-slate-200 my-3" />;
              if (node.type === "meta") return <div key={idx} className="text-[12px] text-slate-500 mb-1">{node.text}</div>;
              return <p key={idx} className="mb-2 leading-7">{node.text}</p>;
            })}
          </div>
        </div>
      </div>

      {/* ── Actions bar ── */}
      <div className="flex items-center gap-2 mt-3">
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {tr("copy", locale)}
        </button>
        <span className="text-[10px] text-slate-400 ms-auto">{refNumber}</span>
      </div>
    </div>
  );
}
