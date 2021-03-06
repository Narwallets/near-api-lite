import { ByteArray, NumArray } from './core/array.js';
export declare const enum SignLength {
    PublicKey = 32,
    SecretKey = 64,
    Seed = 32,
    Signature = 64
}
export interface SignKeyPair {
    publicKey: ByteArray;
    secretKey: ByteArray;
}
export declare function sign(msg: ByteArray, secretKey: ByteArray): ByteArray;
export declare function sign_open(signedMsg: ByteArray, publicKey: ByteArray): ByteArray | undefined;
export declare function sign_detached(msg: ByteArray, secretKey: ByteArray): ByteArray;
export declare function sign_detached_verify(msg: ByteArray, sig: ByteArray, publicKey: ByteArray): boolean;
export declare function sign_keyPair(): SignKeyPair;
export declare function sign_keyPair_fromSecretKey(secretKey: ByteArray): SignKeyPair;
export declare function sign_keyPair_fromSeed(seed: ByteArray): SignKeyPair;
export declare function scalarbase(p: NumArray[], s: ByteArray): void;
export declare function scalarmult(p: NumArray[], q: NumArray[], s: ByteArray): void;
