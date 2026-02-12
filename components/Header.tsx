import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";

type HeaderProps = {
  labels: Record<string, string>;
};

const Header = ({ labels }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
            <Image
              src="/ai-mizan-logo.png"
              alt="AI-Mizan"
              width={28}
              height={28}
            />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">AI-Mizan</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Morocco</p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          <Link className="hover:text-emerald-700" href="/chat">
            {labels.navChat}
          </Link>
          <Link className="hover:text-emerald-700" href="/laws">
            {labels.navLaws}
          </Link>
          <Link className="hover:text-emerald-700" href="/guides">
            {labels.navGuides}
          </Link>
          <Link className="hover:text-emerald-700" href="/updates">
            {labels.navUpdates}
          </Link>
          <Link className="hover:text-emerald-700" href="/about">
            {labels.navAbout}
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/chat"
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            {labels.navAsk}
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
