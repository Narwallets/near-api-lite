import {Assignable} from './enums.js';
import * as nacl from '../tweetnacl/sign.js';
import { encodeBase58, decodeBase58 } from './serialize.js';
//import { Assignable } from './enums';

export type Arrayish = string | ArrayLike<number>;

export interface SignatureAndKey {
    signature: Uint8Array;
    publicKey: PublicKey;
}

/** All supported key types */
export enum KeyType {
    ED25519 = 0,
}

function key_type_to_str(keyType: KeyType): string {
    switch (keyType) {
    case KeyType.ED25519: return 'ed25519';
    default: throw new Error(`Unknown key type ${keyType}`);
    }
}

function str_to_key_type(keyType: string): KeyType {
    switch (keyType.toLowerCase()) {
    case 'ed25519': return KeyType.ED25519;
    default: throw new Error(`Unknown key type ${keyType}`);
    }
}

/**
 * PublicKey representation that has type and bytes of the key.
 */
export class PublicKey extends Assignable {
    keyType!: KeyType 
    data!: Uint8Array

    static from(value: string | PublicKey): PublicKey {
        if (typeof value === 'string') {
            return PublicKey.fromString(value);
        }
        return value;
    }

    static fromString(encodedKey: string): PublicKey {
        const parts = encodedKey.split(':');
        if (parts.length === 1) {
            return new PublicKey({keyType:KeyType.ED25519, data:decodeBase58(parts[0]!)});
        } else if (parts.length === 2) {
            return new PublicKey({keyType:str_to_key_type(parts[0]!),data:decodeBase58(parts[1]!)});
        } else {
            throw new Error('Invalid encoded key format, must be <curve>:<encoded key>');
        }
    }

    toString(): string {
        return `${key_type_to_str(this.keyType)}:${encodeBase58(this.data)}`;
    }
}

export abstract class KeyPair {
    abstract sign(message: Uint8Array): SignatureAndKey;
    abstract verify(message: Uint8Array, signature: Uint8Array): boolean;
    abstract toString(): string;
    abstract getPublicKey(): PublicKey;

    /**
     * @param curve Name of elliptical curve, case-insensitive
     * @returns Random KeyPair based on the curve
     */
    static fromRandom(curve: string): KeyPair {
        switch (curve.toUpperCase()) {
        case 'ED25519': return KeyPairEd25519.fromRandom();
        default: throw new Error(`Unknown curve ${curve}`);
        }
    }

    static fromString(encodedKey: string): KeyPair {
        const parts = encodedKey.split(':') as string[];
        if (parts.length === 1) {
            return new KeyPairEd25519(parts[0]!);
        } else if (parts.length === 2) {
            switch (parts[0]!.toUpperCase()) {
            case 'ED25519': return new KeyPairEd25519(parts[1]);
            default: throw new Error(`Unknown curve: ${parts[0]}`);
            }
        } else {
            throw new Error('Invalid encoded key format, must be <curve>:<encoded key>');
        }
    }
}

/**
 * This class provides key pair functionality for Ed25519 curve:
 * generating key pairs, encoding key pairs, signing and verifying.
 */
export class KeyPairEd25519 extends KeyPair {
    readonly publicKey: PublicKey;
    readonly secretKey: string;

    /**
     * Construct an instance of key pair given a secret key.
     * It's generally assumed that these are encoded in base58.
     * @param {string} secretKey
     */
    constructor(secretKey: string) {
        super();
        const keyPair = nacl.sign_keyPair_fromSecretKey(decodeBase58(secretKey));
        this.publicKey = new PublicKey({keyType:KeyType.ED25519, data:keyPair.publicKey});
        this.secretKey = secretKey;
    }

    /**
     * Generate a new random keypair.
     * @example
     * const keyRandom = KeyPair.fromRandom();
     * keyRandom.publicKey
     * // returns [PUBLIC_KEY]
     *
     * keyRandom.secretKey
     * // returns [SECRET_KEY]
     */
    static fromRandom() {
        const newKeyPair = nacl.sign_keyPair();
        return new KeyPairEd25519(encodeBase58(newKeyPair.secretKey));
    }

    sign(message: Uint8Array): SignatureAndKey {
        const signature = nacl.sign_detached(message, decodeBase58(this.secretKey));
        return { signature, publicKey: this.publicKey };
    }

    verify(message: Uint8Array, signature: Uint8Array): boolean {
        return nacl.sign_detached_verify(message, signature, this.publicKey.data);
    }

    toString(): string {
        return `ed25519:${this.secretKey}`;
    }

    getPublicKey(): PublicKey {
        return this.publicKey;
    }
}
