type FooterProps = {
  labels: Record<string, string>;
};

const Footer = ({ labels }: FooterProps) => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container grid gap-2 py-3 text-xs text-slate-500 md:grid-cols-3">
        <span>{labels.footerSources}</span>
        <span>{labels.footerDisclaimer}</span>
        <span>{labels.footerContact}</span>
      </div>
    </footer>
  );
};

export default Footer;
