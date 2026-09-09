/**
 * Price converter — mirrors lib/helper/price_converter_helper.dart.
 * Formats numbers with N decimals and a currency symbol (configurable, supports
 * both left- and right-side placement per V4.0 ConfigModel.currencySymbolDirection).
 *
 * Supports two call signatures for backwards compatibility:
 *   formatPrice(amount, currency?, decimals?)
 *   formatPrice(amount, options?)
 */

const DEFAULT_CURRENCY = '₹';
const DEFAULT_DECIMALS = 2;

export interface FormatPriceOptions {
  symbol?: string;
  direction?: 'left' | 'right';
  digits?: number;
}

function isOptionsObject(arg: unknown): arg is FormatPriceOptions {
  return !!arg && typeof arg === 'object' && !Array.isArray(arg);
}

export function formatPrice(
  amount: number | null | undefined,
  currencyOrOptions?: string | FormatPriceOptions,
  decimals: number = DEFAULT_DECIMALS
): string {
  const opts: FormatPriceOptions = isOptionsObject(currencyOrOptions)
    ? currencyOrOptions
    : { symbol: typeof currencyOrOptions === 'string' ? currencyOrOptions : DEFAULT_CURRENCY };

  const symbol = opts.symbol ?? DEFAULT_CURRENCY;
  const direction = opts.direction ?? 'left';
  const digits = opts.digits ?? DEFAULT_DECIMALS;

  const n = Number(amount || 0);
  const fixed = n.toFixed(digits);
  const [intPart, decPart] = fixed.split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const result = decPart ? `${withSep}.${decPart}` : withSep;
  return direction === 'right' ? `${result} ${symbol}` : `${symbol} ${result}`;
}

export function convertPrice(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  return formatPrice(amount, currency);
}

export function parsePrice(s: string): number {
  const cleaned = (s || '').replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
