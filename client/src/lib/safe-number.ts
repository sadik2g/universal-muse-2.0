/**
 * Safely converts a value to a number, returning 0 if the value is NaN, null, undefined, or not a valid number
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
}

/**
 * Safely formats a number for display, returning "0" if the value is NaN or invalid
 */
export function safeNumberDisplay(value: any, defaultValue: string = "0"): string {
  const num = safeNumber(value);
  return num.toLocaleString();
}

/**
 * Safely formats a currency value, returning "$0" if the value is NaN or invalid
 */
export function safeCurrencyDisplay(value: any, currency: string = "USD", defaultValue: number = 0): string {
  const num = safeNumber(value, defaultValue);
  return `$${num.toLocaleString()}`;
}