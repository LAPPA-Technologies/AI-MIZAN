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
    { href: "/simulateurs", label: labels.navSimulators || "Simulators" },
    { href: "/laws", label: labels.navLaws },
    { href: "/guides", label: labels.navGuides },
    { href: "/services", label: labels.navServices || "Services" },
    { href: "/updates", label: labels.navUpdates },
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