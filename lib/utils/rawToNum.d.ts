/**
 * Converts a raw amount to a number with the specified number of decimals.
 * Note: js Number has 15 digits precision, will round after that.
 *
 * @param rawAmount - The raw amount as a string or bigint.
 * @param decimals - The number of decimal places to consider.
 * @returns The converted number.
 */
export declare function rawToNum(rawAmount: string | bigint, decimals: number): number;
/**
 * Converts a raw amount to a string with a decimal point.
 *
 * @param rawAmount - The raw amount to be converted, either as a string or bigint.
 * @param decimals - The number of decimal places to include in the resulting string.
 * @returns The formatted string with a decimal point.
 */
export declare function stringWithDecPoint(rawAmount: string | bigint, decimals: number): string;
/**
 * Adds commas to a numeric string for better readability.
 *
 * This function takes a string representation of a number and inserts commas
 * as thousand separators. If the number is negative, the minus sign is preserved.
 *
 * @param str - The string representation of the number to format.
 * @returns The formatted string with commas as thousand separators.
 *
 * @example
 * ```typescript
 * addCommas("1234567"); // "1,234,567"
 * addCommas("-1234567.89"); // "-1,234,567.89"
 * ```
 */
export declare function addCommas(str: string): string;
