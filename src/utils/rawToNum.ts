/**
 * Converts a raw amount to a number with the specified number of decimals.
 * Note: js Number has 15 digits precision, will round after that.
 *
 * @param rawAmount - The raw amount as a string or bigint.
 * @param decimals - The number of decimal places to consider.
 * @returns The converted number.
 */
export function rawToNum(rawAmount: string | bigint, decimals: number): number {
    return Number(stringWithDecPoint(rawAmount, decimals));
}

/**
 * Converts a raw amount to a string with a decimal point.
 *
 * @param rawAmount - The raw amount to be converted, either as a string or bigint.
 * @param decimals - The number of decimal places to include in the resulting string.
 * @returns The formatted string with a decimal point.
 */
export function stringWithDecPoint(rawAmount: string | bigint, decimals: number): string {
    let rawAmountAsString = rawAmount.toString()
    if (rawAmountAsString.indexOf(".") !== -1) throw new Error("a raw amount can't have a decimal point: " + rawAmountAsString)
    let sign = ""
    if (rawAmountAsString.startsWith("-")) {
        sign = "-"
        rawAmountAsString = rawAmountAsString.slice(1)
    }
    const padded = rawAmountAsString.padStart(decimals + 1, "0") // at least 0.xxx
    return sign + padded.slice(0, -decimals) + "." + padded.slice(-decimals)
}

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
export function addCommas(str: string): string {
    let pre;
    if (str.startsWith("-")) {
        str = str.slice(1);
        pre = "-";
    }
    else {
        pre = "";
    }
    const decPointPosition = str.indexOf(".")
    let n = (decPointPosition == -1 ? str.length : decPointPosition) - 4
    while (n >= 0) {
        str = str.slice(0, n + 1) + "," + str.slice(n + 1)
        n = n - 3
    }
    return pre + str;
}
