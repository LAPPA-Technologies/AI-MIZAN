"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  getCourtById,
  getNearbyCourts,
  courtTypeLabels,
  courtTypeIcons,
  regions,
} from "../../../../data/courts";
import { getClientDictionary } from "../../../../lib/i18nClient";

const CourtDetailPage = () => {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const dict = getClientDictionary();
  const locale = (dict.language as "fr" | "ar" | "en") || "fr";
  const isRTL = locale === "ar";

  const court = useMemo(() => getCourtById(id), [id]);
  const nearby = useMemo(() => (court ? getNearbyCourts(court, 6) : []), [court]);

  if (!court) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-700">
            {dict.courtNotFound || "Court not found"}
          </h2>
          <Link href="/services/courts" className="btn-primary inline-flex text-sm">
            {dict.backToCourts || "Back to courts directory"}
          </Link>
        </div>
      </div>
    );
  }

  const typeLabel = courtTypeLabels[court.type]?.[locale] || courtTypeLabels[court.type]?.fr || court.type;
  const regionObj = regions.find((r) => r.id === court.region);
  const regionLabel = regionObj ? regionObj[locale] || regionObj.fr : court.region;

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/services" className="hover:text-green-700 transition-colors">
            {dict.navServices || "Services"}
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/services/courts" className="hover:text-green-700 transition-colors">
            {dict.courtsDirectoryBadge || "Courts"}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate max-w-[200px]">
            {court.name[locale] || court.name.fr}
          </span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">{courtTypeIcons[court.type]}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                  {court.name[locale] || court.name.fr}
                </h1>
                {locale !== "fr" && (
                  <p className="text-sm text-slate-500">{court.name.fr}</p>
                )}
                {locale !== "ar" && (
                  <p className="text-sm text-slate-500" dir="rtl">{court.name.ar}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
                    {courtTypeIcons[court.type]} {typeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    📍 {court.city}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                    🗺️ {regionLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Contact card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {dict.courtsContactInfo || "Contact Information"}
            </h2>

            {/* Phone */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {dict.courtsPhone || "Phone"}
              </p>
              <a
                href={`tel:${court.phone.replace(/\s/g, "")}`}
                className="text-lg font-bold text-green-700 hover:text-green-800 transition-colors"
                dir="ltr"
              >
                {court.phone}
              </a>
            </div>

            {/* Fax */}
            {court.fax && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fax</p>
                <p className="text-sm text-slate-600" dir="ltr">{court.fax}</p>
              </div>
            )}

            {/* Email */}
            {court.email && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
                <a
                  href={`mailto:${court.email}`}
                  className="text-sm font-medium text-green-700 hover:text-green-800 break-all"
                >
                  {court.email}
                </a>
              </div>
            )}

            {/* Address */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {dict.courtsAddress || "Address"}
              </p>
              <p className="text-sm text-slate-700">{court.address.fr}</p>
              <p className="text-sm text-slate-500" dir="rtl">{court.address.ar}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={`tel:${court.phone.replace(/\s/g, "")}`}
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {dict.courtsCall || "Call"}
              </a>
              <a
                href={court.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-sm inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {dict.courtsOpenMap || "Open in Maps"}
              </a>
            </div>
          </div>

          {/* Map card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {dict.courtsMap || "Map"}
              </h2>
            </div>
            <div className="flex-1 min-h-[280px]">
              <iframe
                title={`Map – ${court.name.fr}`}
                src={`https://www.google.com/maps?q=${court.lat},${court.lng}&z=15&output=embed`}
                className="w-full h-full min-h-[280px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Nearby courts */}
        {nearby.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {dict.courtsNearby || "Nearby Courts"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((nc) => (
                <Link
                  key={nc.id}
                  href={`/services/courts/${nc.id}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all group p-4 block space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{courtTypeIcons[nc.type]}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors leading-tight">
                        {nc.name[locale] || nc.name.fr}
                      </h3>
                      <p className="text-xs text-green-700 font-medium mt-0.5">
                        {courtTypeLabels[nc.type]?.[locale] || courtTypeLabels[nc.type]?.fr}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-300 group-hover:text-green-500 shrink-0 transition-colors ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    📍 {nc.city} — {nc.address[locale === "ar" ? "ar" : "fr"]}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center space-y-3 py-8 px-4">
          <h3 className="text-lg font-bold text-slate-900">
            {dict.servicesCta || "Need legal guidance?"}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {dict.servicesCtaBody || "Ask AI-Mizan about your legal situation and get article-backed answers."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
              {dict.navAsk || "Ask AI-Mizan"}
            </Link>
            <Link href="/services/documents" className="btn-outline inline-flex items-center gap-2">
              {dict.documentsPageTitle || "Documents & Forms"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetailPage;
