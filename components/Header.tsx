"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageDropdown from "./LanguageDropdown";
import MobileNav from "./MobileNav";

type HeaderProps = {
  labels: Record<string, string>;
};

const Header = ({ labels }: HeaderProps) => {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const dir = document.documentElement.dir;
    const lang = document.documentElement.lang;
    const cookieMatch = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    const locale = cookieMatch?.[1] ? decodeURIComponent(cookieMatch[1]) : lang;
    setIsRTL(dir === "rtl" || locale === "ar");
  }, []);

  const navItems = [
    { href: "/laws", label: labels.navLaws },
    { href: "/guides", label: labels.navGuides },
    { href: "/services", label: labels.navServices || "Services" },
    { href: "/updates", label: labels.navUpdates },
    { href: "/simulateurs", label: labels.navSimulators || "Simulators" },
    { href: "/about", label: labels.navAbout },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-4">

          {/* Logo — always on the inline-start side */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group"
            dir="ltr"
          >
            <img
              src="/ai-mizan-logo.png"
              alt="Al-Mizan logo"
              className="h-9 w-9 object-contain"
            />
            <div className="leading-tight">
              <span className="block text-base font-bold text-slate-900 tracking-tight">
                Al-Mizan
              </span>
              <span className="hidden sm:block text-[11px] text-green-700 font-medium tracking-wide uppercase">
                {labels.headerTagline || "Moroccan Law Engine"}
              </span>
            </div>
          </Link>

          {/* Desktop nav — center */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* CTA — desktop only */}
            <Link
              href="/chat"
              className="hidden lg:inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 active:bg-green-800 transition-all whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              {labels.navAsk}
            </Link>

            {/* Language — far right on desktop */}
            <div className="hidden lg:block ms-9">
              <LanguageDropdown />
            </div>

            {/* Hamburger — mobile/tablet only */}
            <div className="lg:hidden">
              <MobileNav labels={labels} />
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;