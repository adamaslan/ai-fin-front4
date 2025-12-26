const VALID_SYMBOL_REGEX = /^[A-Z]{1,5}$/;

export function validateSymbols(input: string): string[] {
  return input
    .toUpperCase()
    .split(',')
    .map((s) => s.trim())
    .filter((s) => VALID_SYMBOL_REGEX.test(s))
    .slice(0, 10);
}

export function sanitizeSymbol(symbol: string): string | null {
  const cleaned = symbol.toUpperCase().trim();
  return VALID_SYMBOL_REGEX.test(cleaned) ? cleaned : null;
}
