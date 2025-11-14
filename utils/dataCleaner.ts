
/**
 * Attempts to parse a value into a number after sanitizing it.
 * Removes common currency symbols and thousands separators.
 * @param value The value to parse.
 * @returns A number, or null if parsing is not possible.
 */
export const parseNumericValue = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  // Remove common currency symbols and thousands separators.
  const sanitized = value.trim().replace(/[$,€£,]/g, '');

  // Avoid parsing empty strings or just a dot/minus as a number
  if (sanitized === '' || sanitized === '.' || sanitized === '-') return null;

  const num = parseFloat(sanitized);
  return isNaN(num) ? null : num;
};

/**
 * Checks if a value can be considered numeric after sanitization.
 * @param value The value to check.
 * @returns True if the value is numeric, false otherwise.
 */
export const isPotentiallyNumeric = (value: any): boolean => {
  return parseNumericValue(value) !== null;
};
