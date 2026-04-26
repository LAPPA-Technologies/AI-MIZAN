import DisclaimerBanner from "../DisclaimerBanner";

interface DivorceComingSoonProps {
  dict: Record<string, string>;
  lang: string;
}

export default function DivorceComingSoon({ dict, lang }: DivorceComingSoonProps) {
  const isRtl = lang === "ar";
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ⚖️
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dict.simDivorceTitle}</h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">{dict.simDivorceDescription}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800">
          {dict.simComingSoon}
        </span>
      </div>
      <DisclaimerBanner text={dict.simResultDisclaimer} />
    </div>
  );
}
