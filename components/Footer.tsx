import Link from "next/link";

type FooterProps = {
  labels: Record<string, string>;
};

const Footer = ({ labels }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      {/* Main footer content */}
      <div className="container py-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 text-white text-sm">⚖️</span>
              <span className="text-base font-bold text-slate-900">AI-Mizan</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {labels.footerTagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {labels.footerNavTitle || "Navigation"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/laws" className="text-slate-600 hover:text-green-700 transition-colors">{labels.navLaws}</Link></li>
              <li><Link href="/guides" className="text-slate-600 hover:text-green-700 transition-colors">{labels.navGuides}</Link></li>
              <li><Link href="/updates" className="text-slate-600 hover:text-green-700 transition-colors">{labels.navUpdates}</Link></li>
              <li><Link href="/simulateurs" className="text-slate-600 hover:text-green-700 transition-colors">{labels.navSimulators || 'Simulators'}</Link></li>
              <li><Link href="/about" className="text-slate-600 hover:text-green-700 transition-colors">{labels.navAbout}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {labels.footerLegalTitle || "Legal"}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-600 hover:text-green-700 transition-colors">{labels.footerAbout}</Link></li>
              <li><Link href="/about" className="text-slate-600 hover:text-green-700 transition-colors">{labels.footerPrivacy}</Link></li>
              <li><Link href="/about" className="text-slate-600 hover:text-green-700 transition-colors">{labels.footerTerms}</Link></li>
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              {labels.footerSourcesTitle || "Sources"}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {labels.footerSources}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {labels.footerContact}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 bg-white">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 py-4 text-xs text-slate-500">
          <span>© {year} AI-Mizan. {labels.footerDisclaimer}</span>
          <span className="flex items-center gap-1">
            <img src="https://flagcdn.com/ma.svg" alt="Morocco" width="20" height="15" className="rounded-sm" />
            {labels.footerMadeIn || "Made in Morocco"}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
