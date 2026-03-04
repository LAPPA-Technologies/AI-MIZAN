import React from "react";

export function PageSection({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-6 md:py-8 ${className ?? ""}`}>
      {title && <h2 className="text-slate-900 font-semibold text-lg mb-4">{title}</h2>}
      <div>{children}</div>
    </section>
  );
}
