/**
 * convert nears expressed as a js-number with MAX 4 decimals into a yoctos-string
 * @param n amount in near MAX 6 DECIMALS
 */
export declare function ntoy(n: number): string;
/**
 * returns amount truncated to 4 decimal places
 * @param yoctos amount expressed in yoctos
 */
export declare function yton(yoctos: string): number;
export declare function ytonb(yoctos: bigint): number;
export declare function ytonFull(str: string): string;
