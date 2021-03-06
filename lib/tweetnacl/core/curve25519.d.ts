import { ByteArray, NumArray } from './array.js';
export declare function set25519(r: NumArray, a: NumArray): void;
export declare function sel25519(p: NumArray, q: NumArray, b: number): void;
export declare function pack25519(o: ByteArray, n: NumArray): void;
export declare function neq25519(a: NumArray, b: NumArray): number;
export declare function par25519(a: NumArray): number;
export declare function unpack25519(o: NumArray, n: ByteArray): void;
export declare function inv25519(o: NumArray, i: NumArray): void;
