import { ByteArray } from './array.js';
export declare const enum HashLength {
    Hash = 64
}
export declare function hash(msg: ByteArray): ByteArray;
export declare function _hash(out: ByteArray, m: ByteArray, n: number): number;
