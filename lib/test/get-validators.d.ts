/**
 * convert nears expressed as a js-number with MAX 6 decimals into a yoctos-string
 * @param n amount in near MAX 4 DECIMALS
 */
export declare function ntoy(n: number): string;
/**
 * returns amount truncated to 4 decimal places
 * @param yoctos amount expressed in yoctos
 */
export declare function yton(yoctos: string): number;
export declare function getValidators(): Promise<void>;
