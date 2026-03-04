"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { courts, courtTypeLabels, courtTypeIcons, regions, getAllCities, getAllCourtTypes } from "../../../data/courts";
import type { Court, CourtType } from "../../../data/courts";
import { getClientDictionary } from "../../../lib/i18nClient";

const CourtsPage = () => {
  const dict = getClientDictionary();
  const locale = (dict.language as "fr" | "ar" | "en") || "fr";
  const isRTL = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CourtType | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const allTypes = useMemo(() => getAllCourtTypes(), []);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      if (selectedType !== "all" && court.type !== selectedType) return false;
      if (selectedRegion !== "all" && court.region !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCity = court.city.toLowerCase().includes(q);
        const matchName =
          court.name.fr.toLowerCase().includes(q) ||
          court.name.ar.includes(q) ||
          court.name.en.toLowerCase().includes(q);
        const matchAddress =
          court.address.fr.toLowerCase().includes(q) ||
          court.address.ar.includes(q);
        if (!matchCity && !matchName && !matchAddress) return false;
      }
      return true;
    });
  }, [searchQuery, selectedType, selectedRegion]);

  // Group by city
  const groupedByCity = useMemo(() => {
    const map = new Map<string, Court[]>();
    for (const court of filteredCourts) {
      const list = map.get(court.city) || [];
      list.push(court);
      map.set(court.city, list);
    }
    return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr")));
  }, [filteredCourts]);

  const getLabel = useCallback(
    (type: CourtType) => courtTypeLabels[type]?.[locale] || courtTypeLabels[type]?.fr || type,
    [locale],
  );

  const getRegionLabel = useCallback(
    (regionId: string) => {
      const r = regions.find((reg) => reg.id === regionId);
      return r ? r[locale] || r.fr : regionId;
    },
    [locale],
  );

  const totalCourts = filteredCourts.length;

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
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-1.5 text-xs font-semibold text-green-700">
            🏛️ {dict.courtsDirectoryBadge || "Courts Directory"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {dict.courtsDirectoryTitle || "Annuaire des Tribunaux du Maroc"}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {dict.courtsDirectorySubtitle || "Find courts by city, type, and region. Get addresses, phone numbers, and directions."}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {dict.courtsSearchLabel || "Search city or court"}
              </label>
              <div className="relative">
                <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.courtsSearchPlaceholder || "Casablanca, Rabat, Fès..."}
                  className={`input-shell ${isRTL ? "pr-10" : "pl-10"}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {dict.courtsTypeLabel || "Court type"}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as CourtType | "all")}
                className="input-shell"
              >
                <option value="all">{dict.courtsAllTypes || "All types"}</option>
                {allTypes.map((type) => (
                  <option key={type} value={type}>
                    {courtTypeIcons[type]} {getLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {dict.courtsRegionLabel || "Region"}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="input-shell"
              >
                <option value="all">{dict.courtsAllRegions || "All regions"}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r[locale] || r.fr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-center">
                <span className="text-lg font-bold text-green-700">{totalCourts}</span>
                <span className="text-xs text-green-600 block">
                  {dict.courtsCourtsFound || "courts found"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Court Hierarchy Quick Reference */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {dict.courtHierarchy || "Court Hierarchy"}
          </h2>
          <div className="flex flex-col items-center gap-1.5">
            <span className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-bold shadow-sm">
              🏛️ {courtTypeLabels.cour_cassation[locale]}
            </span>
            <span className="text-slate-300 text-lg">▼</span>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-green-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                ⚖️ {courtTypeLabels.cour_appel[locale]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                💼 {courtTypeLabels.cour_appel_commerce[locale]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                📋 {courtTypeLabels.cour_appel_admin[locale]}
              </span>
            </div>
            <span className="text-slate-300 text-lg">▼</span>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-green-100 text-green-800 px-3 py-1.5 text-xs font-semibold border border-green-200">
                🏛️ {courtTypeLabels.tribunal_premiere_instance[locale]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-800 px-3 py-1.5 text-xs font-semibold border border-blue-200">
                💼 {courtTypeLabels.tribunal_commerce[locale]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-semibold border border-amber-200">
                📋 {courtTypeLabels.tribunal_administratif[locale]}
              </span>
            </div>
          </div>
        </div>

        {/* Results grouped by city — card-based (no accordion) */}
        {groupedByCity.size > 0 ? (
          <div className="space-y-8">
            {[...groupedByCity.entries()].map(([city, cityCourts]) => (
              <section key={city} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">📍 {city}</h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cityCourts.length} {cityCourts.length === 1 ? "tribunal" : "tribunaux"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getRegionLabel(cityCourts[0]?.region || "")}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cityCourts.map((court) => (
                    <Link
                      key={court.id}
                      href={`/services/courts/${court.id}`}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all group p-4 block space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0 mt-0.5">{courtTypeIcons[court.type]}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors leading-tight">
                            {court.name[locale] || court.name.fr}
                          </h3>
                          <p className="text-xs text-green-700 font-medium mt-0.5">
                            {getLabel(court.type)}
                          </p>
                        </div>
                        <svg className={`w-4 h-4 text-slate-300 group-hover:text-green-500 shrink-0 transition-colors ${isRTL ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {court.address[locale === "ar" ? "ar" : "fr"]}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span dir="ltr">{court.phone}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-16 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {dict.courtsNoneFound || "No courts found"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {dict.courtsNoneFoundHint || "Try changing your search or filters."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedRegion("all");
              }}
              className="btn-outline inline-flex text-sm"
            >
              {dict.clearFilters || "Clear filters"}
            </button>
          </div>
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
            <Link href="/laws" className="btn-outline inline-flex items-center gap-2">
              {dict.heroCtaLaws || "Browse Laws"}
            </Link>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 pb-4 space-y-1">
          <p>{dict.courtsDataSource || "Data source: Ministry of Justice (justice.gov.ma)"}</p>
          <p>© 2026 AI-Mizan</p>
        </footer>
      </div>
    </div>
  );
};

export default CourtsPage;
