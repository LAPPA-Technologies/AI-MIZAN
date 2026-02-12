import { getDictionary, getLocale } from "../lib/i18n";

const NotFound = async () => {
  const dict = getDictionary(await getLocale());

  return (
    <div className="section">
      <h1 className="text-3xl font-semibold">{dict.notFoundTitle}</h1>
      <p className="text-slate-600">{dict.notFoundBody}</p>
    </div>
  );
};

export default NotFound;
