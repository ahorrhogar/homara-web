const DIACRITICS = /[̀-ͯ]/g;

export function normalizeSearchTerm(term: string): string {
  return term.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim().replace(/\s+/g, " ");
}
