import Link from "next/link";
import { getDictionary, getLocale } from "../lib/i18n";

const NotFound = async () => {
  const dict = getDictionary(await getLocale());

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-slate-200">404</div>
        <h1 className="text-2xl font-bold text-slate-900">{dict.notFoundTitle}</h1>
        <p className="text-slate-600">{dict.notFoundBody}</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">{dict.navHome}</Link>
          <Link href="/laws" className="btn-outline">{dict.navLaws}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
