"use client";

import type { Locale } from "../../lib/forms/types";
import { renderDocumentText } from "../../lib/forms/documentTemplates";
import { t as tr } from "../../lib/forms/translations";

/* ─── Dynamic import to avoid SSR issues with jsPDF ──────────── */
async function getJsPDF() {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
}

/* ─── Public API ─────────────────────────────────────────────── */

export async function generatePDF(
  docId: string,
  docTitle: string,
  locale: Locale,
  data: Record<string, unknown>,
  refNumber: string,
): Promise<void> {
  const isRTL = locale === "ar";
  const text = renderDocumentText(docId, locale, data, refNumber);

  // Build a simple HTML fragment mirroring the preview styling so html2pdf
  // can render it with correct fonts (including Arabic) via html2canvas.
  const container = document.createElement("div");
  container.style.maxWidth = "800px";
  container.style.margin = "0 auto";
  container.style.padding = "18px";
  container.style.background = "white";
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Naskh Arabic', Arial, sans-serif";
  container.style.direction = isRTL ? "rtl" : "ltr";

  // Top accent
  const accent = document.createElement("div");
  accent.style.height = "6px";
  accent.style.background = "#16a34a"; // green-600
  accent.style.borderRadius = "2px";
  accent.style.marginBottom = "12px";
  container.appendChild(accent);

  // Title block
  const titleBlock = document.createElement("div");
  titleBlock.style.textAlign = "center";
  titleBlock.innerHTML = `<div style='font-size:14px;font-weight:700;color:#1f2937;'>${escapeHtml(docTitle)}</div><div style='font-size:11px;color:#64748b;margin-top:6px;'>${escapeHtml(refNumber)}</div>`;
  container.appendChild(titleBlock);

  // Content
  const content = document.createElement("div");
  content.style.marginTop = "14px";
  content.style.color = "#374151";
  content.style.fontSize = "12px";
  content.innerHTML = textToHtml(text);
  container.appendChild(content);

  // Watermark
  container.style.position = "relative";
  const watermark = document.createElement("div");
  watermark.style.position = "absolute";
  watermark.style.inset = "0";
  watermark.style.display = "flex";
  watermark.style.alignItems = "center";
  watermark.style.justifyContent = "center";
  watermark.style.pointerEvents = "none";
  watermark.innerHTML = `<div style="font-size:72px;color:rgba(203,213,225,0.55);transform:rotate(-12deg);font-weight:700;">AL-MIZAN</div>`;
  container.appendChild(watermark);

  // Attach to DOM for html2pdf to render
  document.body.appendChild(container);

  try {
    if ("fonts" in document) {
      try { await (document as any).fonts.ready; } catch {}
    }

    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = (html2pdfModule as any).default ?? html2pdfModule;

    const filename = `${docId}-${locale}-${refNumber}.pdf`;

    await html2pdf()
      .set({
        filename,
        margin: [10, 12, 14, 12],
        pagebreak: { mode: ["css", "legacy"] },
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .save();
  } finally {
    // cleanup
    document.body.removeChild(container);
  }
}

// Convert plain document text into simple HTML with headings, separators and paragraphs
function textToHtml(raw: string) {
  const lines = raw.split("\n");
  let out = "";
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      out += `<p style=\"margin:0 0 10px;line-height:1.6;\">${escapeHtml(para.join(' '))}</p>`;
      para = [];
    }
  };

  for (let l of lines) {
    const line = l.trim();
    if (!line) { flush(); continue; }
    if (line === '---') { flush(); out += '<hr style="border:none;border-top:1px solid #e6e6e6;margin:10px 0;" />'; continue; }
    if (/^(Ref|Date|المرجع|التاريخ)[:\s]/i.test(line)) { flush(); out += `<div style=\"font-size:12px;color:#64748b;margin-bottom:6px;\">${escapeHtml(line)}</div>`; continue; }
    const isHeading = line === line.toUpperCase() && line.length > 3 && !/^\d/.test(line);
    if (isHeading) { flush(); out += `<h3 style=\"margin:12px 0 6px;font-size:13px;color:#111827;\">${escapeHtml(line)}</h3>`; continue; }
    para.push(line);
  }
  flush();
  return out;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>\"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;" }[c] as string));
}

/* ─── Download as TXT ────────────────────────────────────────── */
export function downloadAsTxt(
  docId: string,
  locale: Locale,
  data: Record<string, unknown>,
  refNumber: string,
): void {
  const text = renderDocumentText(docId, locale, data, refNumber);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${docId}-${locale}-${refNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── Share via WhatsApp ─────────────────────────────────────── */
export function shareViaWhatsApp(
  docId: string,
  docTitle: string,
  locale: Locale,
  data: Record<string, unknown>,
  refNumber: string,
): void {
  const text = renderDocumentText(docId, locale, data, refNumber);
  // WhatsApp has a ~65k char limit, truncate if needed
  const truncated = text.length > 4000 ? text.slice(0, 4000) + "\n\n..." : text;
  const encoded = encodeURIComponent(`📄 ${docTitle}\n${refNumber}\n\n${truncated}`);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}
