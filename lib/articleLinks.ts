// Text passed here comes from the app's own DB and i18n files — not user input.
// dangerouslySetInnerHTML is safe for this use case.
export function makeArticleLinksClickable(
  text: string,
  code: string,
  lang: string
): string {
  // Order matters: match longer patterns first to avoid partial replacements
  const patterns: RegExp[] = [
    /(المادة\s+رقم\s+)(\d+)/g,
    /(المادة\s+)(\d+)/g,
    /\b(Art\.?\s*)(\d+)/gi,
  ];

  let result = text;
  for (const pattern of patterns) {
    result = result.replace(pattern, (_match, prefix, num) => {
      const href = `/laws/${code}/articles/${num}?lang=${lang}`;
      return `<a href="${href}" class="text-green-700 hover:text-green-900 underline decoration-dotted font-medium" target="_blank">${prefix}${num}</a>`;
    });
  }
  return result;
}
