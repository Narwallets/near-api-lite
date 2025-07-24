"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scalarmult = exports.scalarbase = exports.sign_keyPair_fromSeed = exports.sign_keyPair_fromSecretKey = exports.sign_keyPair = exports.sign_detached_verify = exports.sign_detached = exports.sign_open = exports.sign = void 0;
const array_js_1 = require("./core/array.js");
const verify_js_1 = require("./core/verify.js");
const core_js_1 = require("./core/core.js");
const random_js_1 = require("./core/random.js");
const curve25519_js_1 = require("./core/curve25519.js");
const hash_js_1 = require("./core/hash.js");
function sign(msg, secretKey) {
    (0, array_js_1.checkArrayTypes)(msg, secretKey);
    if (secretKey.length !== 64 /* SignLength.SecretKey */)
        throw new Error('bad secret key size');
    const signedMsg = (0, array_js_1.ByteArray)(64 /* SignLength.Signature */ + msg.length);
    _sign(signedMsg, msg, msg.length, secretKey);
    return signedMsg;
}
exports.sign = sign;
function sign_open(signedMsg, publicKey) {
    (0, array_js_1.checkArrayTypes)(signedMsg, publicKey);
    if (publicKey.length !== 32 /* SignLength.PublicKey */)
        throw new Error('bad public key size');
    const tmp = (0, array_js_1.ByteArray)(signedMsg.length);
    const mlen = _sign_open(tmp, signedMsg, signedMsg.length, publicKey);
    if (mlen < 0)
        return;
    const m = (0, array_js_1.ByteArray)(mlen);
    for (let i = 0; i < m.length; i++)
        m[i] = tmp[i];
    return m;
}
exports.sign_open = sign_open;
function sign_detached(msg, secretKey) {
    const signedMsg = sign(msg, secretKey);
    const sig = (0, array_js_1.ByteArray)(64 /* SignLength.Signature */);
    for (let i = 0; i < sig.length; i++)
        sig[i] = signedMsg[i];
    return sig;
}
exports.sign_detached = sign_detached;
function sign_detached_verify(msg, sig, publicKey) {
    (0, array_js_1.checkArrayTypes)(msg, sig, publicKey);
    if (sig.length !== 64 /* SignLength.Signature */)
        throw new Error('bad signature size');
    if (publicKey.length !== 32 /* SignLength.PublicKey */)
        throw new Error('bad public key size');
    const sm = (0, array_js_1.ByteArray)(64 /* SignLength.Signature */ + msg.length);
    const m = (0, array_js_1.ByteArray)(64 /* SignLength.Signature */ + msg.length);
    let i;
    for (i = 0; i < 64 /* SignLength.Signature */; i++)
        sm[i] = sig[i];
    for (i = 0; i < msg.length; i++)
        sm[i + 64 /* SignLength.Signature */] = msg[i];
    return _sign_open(m, sm, sm.length, publicKey) >= 0;
}
exports.sign_detached_verify = sign_detached_verify;
function sign_keyPair() {
    const pk = (0, array_js_1.ByteArray)(32 /* SignLength.PublicKey */);
    const sk = (0, array_js_1.ByteArray)(64 /* SignLength.SecretKey */);
    _sign_keypair(pk, sk, false);
    return { publicKey: pk, secretKey: sk };
}
exports.sign_keyPair = sign_keyPair;
function sign_keyPair_fromSecretKey(secretKey) {
    (0, array_js_1.checkArrayTypes)(secretKey);
    if (secretKey.length !== 64 /* SignLength.SecretKey */)
        throw new Error('bad secret key size');
    const pk = (0, array_js_1.ByteArray)(32 /* SignLength.PublicKey */);
    for (let i = 0; i < pk.length; i++)
        pk[i] = secretKey[32 + i];
    return { publicKey: pk, secretKey: (0, array_js_1.ByteArray)(secretKey) };
}
exports.sign_keyPair_fromSecretKey = sign_keyPair_fromSecretKey;
function sign_keyPair_fromSeed(seed) {
    (0, array_js_1.checkArrayTypes)(seed);
    if (seed.length !== 32 /* SignLength.Seed */)
        throw new Error('bad seed size');
    const pk = (0, array_js_1.ByteArray)(32 /* SignLength.PublicKey */);
    const sk = (0, array_js_1.ByteArray)(64 /* SignLength.SecretKey */);
    for (let i = 0; i < 32; i++)
        sk[i] = seed[i];
    _sign_keypair(pk, sk, true);
    return { publicKey: pk, secretKey: sk };
}
exports.sign_keyPair_fromSeed = sign_keyPair_fromSeed;
// low level
function _sign_keypair(pk, sk, seeded) {
    const d = (0, array_js_1.ByteArray)(64);
    const p = [(0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)()];
    let i;
    if (!seeded)
        sk = (0, random_js_1.randomBytes)(32);
    (0, hash_js_1._hash)(d, sk, 32);
    d[0] &= 248;
    d[31] &= 127;
    d[31] |= 64;
    scalarbase(p, d);
    pack(pk, p);
    for (i = 0; i < 32; i++)
        sk[i + 32] = pk[i];
    return 0;
}
// Note: difference from C - smlen returned, not passed as argument.
function _sign(sm, m, n, sk) {
    const d = (0, array_js_1.ByteArray)(64), h = (0, array_js_1.ByteArray)(64), r = (0, array_js_1.ByteArray)(64);
    const x = (0, array_js_1.NumArray)(64);
    const p = [(0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)()];
    let i, j;
    (0, hash_js_1._hash)(d, sk, 32);
    d[0] &= 248;
    d[31] &= 127;
    d[31] |= 64;
    const smlen = n + 64;
    for (i = 0; i < n; i++)
        sm[64 + i] = m[i];
    for (i = 0; i < 32; i++)
        sm[32 + i] = d[32 + i];
    (0, hash_js_1._hash)(r, sm.subarray(32), n + 32);
    reduce(r);
    scalarbase(p, r);
    pack(sm, p);
    for (i = 32; i < 64; i++)
        sm[i] = sk[i];
    (0, hash_js_1._hash)(h, sm, n + 64);
    reduce(h);
    for (i = 0; i < 64; i++)
        x[i] = 0;
    for (i = 0; i < 32; i++)
        x[i] = r[i];
    for (i = 0; i < 32; i++) {
        for (j = 0; j < 32; j++) {
            x[i + j] += h[i] * d[j];
        }
    }
    modL(sm.subarray(32), x);
    return smlen;
}
function _sign_open(m, sm, n, pk) {
    const t = (0, array_js_1.ByteArray)(32), h = (0, array_js_1.ByteArray)(64);
    const p = [(0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)()], q = [(0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)()];
    let i, mlen;
    mlen = -1;
    if (n < 64 || unpackneg(q, pk))
        return -1;
    for (i = 0; i < n; i++)
        m[i] = sm[i];
    for (i = 0; i < 32; i++)
        m[i + 32] = pk[i];
    (0, hash_js_1._hash)(h, m, n);
    reduce(h);
    scalarmult(p, q, h);
    scalarbase(q, sm.subarray(32));
    add(p, q);
    pack(t, p);
    n -= 64;
    if ((0, verify_js_1._verify_32)(sm, 0, t, 0)) {
        for (i = 0; i < n; i++)
            m[i] = 0;
        return -1;
    }
    for (i = 0; i < n; i++)
        m[i] = sm[i + 64];
    mlen = n;
    return mlen;
}
function scalarbase(p, s) {
    const q = [(0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)(), (0, core_js_1.gf)()];
    (0, curve25519_js_1.set25519)(q[0], core_js_1.X);
    (0, curve25519_js_1.set25519)(q[1], core_js_1.Y);
    (0, curve25519_js_1.set25519)(q[2], core_js_1.gf1);
    (0, core_js_1.M)(q[3], core_js_1.X, core_js_1.Y);
    scalarmult(p, q, s);
}
exports.scalarbase = scalarbase;
function scalarmult(p, q, s) {
    let b, i;
    (0, curve25519_js_1.set25519)(p[0], core_js_1.gf0);
    (0, curve25519_js_1.set25519)(p[1], core_js_1.gf1);
    (0, curve25519_js_1.set25519)(p[2], core_js_1.gf1);
    (0, curve25519_js_1.set25519)(p[3], core_js_1.gf0);
    for (i = 255; i >= 0; --i) {
        b = (s[(i / 8) | 0] >> (i & 7)) & 1;
        cswap(p, q, b);
        add(q, p);
        add(p, p);
        cswap(p, q, b);
    }
}
exports.scalarmult = scalarmult;
function pack(r, p) {
    const tx = (0, core_js_1.gf)(), ty = (0, core_js_1.gf)(), zi = (0, core_js_1.gf)();
    (0, curve25519_js_1.inv25519)(zi, p[2]);
    (0, core_js_1.M)(tx, p[0], zi);
    (0, core_js_1.M)(ty, p[1], zi);
    (0, curve25519_js_1.pack25519)(r, ty);
    r[31] ^= (0, curve25519_js_1.par25519)(tx) << 7;
}
function unpackneg(r, p) {
    const t = (0, core_js_1.gf)(), chk = (0, core_js_1.gf)(), num = (0, core_js_1.gf)(), den = (0, core_js_1.gf)(), den2 = (0, core_js_1.gf)(), den4 = (0, core_js_1.gf)(), den6 = (0, core_js_1.gf)();
    (0, curve25519_js_1.set25519)(r[2], core_js_1.gf1);
    (0, curve25519_js_1.unpack25519)(r[1], p);
    (0, core_js_1.S)(num, r[1]);
    (0, core_js_1.M)(den, num, core_js_1.D);
    (0, core_js_1.Z)(num, num, r[2]);
    (0, core_js_1.A)(den, r[2], den);
    (0, core_js_1.S)(den2, den);
    (0, core_js_1.S)(den4, den2);
    (0, core_js_1.M)(den6, den4, den2);
    (0, core_js_1.M)(t, den6, num);
    (0, core_js_1.M)(t, t, den);
    pow2523(t, t);
    (0, core_js_1.M)(t, t, num);
    (0, core_js_1.M)(t, t, den);
    (0, core_js_1.M)(t, t, den);
    (0, core_js_1.M)(r[0], t, den);
    (0, core_js_1.S)(chk, r[0]);
    (0, core_js_1.M)(chk, chk, den);
    if ((0, curve25519_js_1.neq25519)(chk, num))
        (0, core_js_1.M)(r[0], r[0], core_js_1.I);
    (0, core_js_1.S)(chk, r[0]);
    (0, core_js_1.M)(chk, chk, den);
    if ((0, curve25519_js_1.neq25519)(chk, num))
        return -1;
    if ((0, curve25519_js_1.par25519)(r[0]) === (p[31] >> 7))
        (0, core_js_1.Z)(r[0], core_js_1.gf0, r[0]);
    (0, core_js_1.M)(r[3], r[0], r[1]);
    return 0;
}
function reduce(r) {
    const x = (0, array_js_1.NumArray)(64);
    let i;
    for (i = 0; i < 64; i++)
        x[i] = r[i];
    for (i = 0; i < 64; i++)
        r[i] = 0;
    modL(r, x);
}
const L = (0, array_js_1.NumArray)([0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10]);
function modL(r, x) {
    let carry, i, j, k;
    for (i = 63; i >= 32; --i) {
        carry = 0;
        for (j = i - 32, k = i - 12; j < k; ++j) {
            x[j] += carry - 16 * x[i] * L[j - (i - 32)];
            carry = (x[j] + 128) >> 8;
            x[j] -= carry * 256;
        }
        x[j] += carry;
        x[i] = 0;
    }
    carry = 0;
    for (j = 0; j < 32; j++) {
        x[j] += carry - (x[31] >> 4) * L[j];
        carry = x[j] >> 8;
        x[j] &= 255;
    }
    for (j = 0; j < 32; j++)
        x[j] -= carry * L[j];
    for (i = 0; i < 32; i++) {
        x[i + 1] += x[i] >> 8;
        r[i] = x[i] & 255;
    }
}
function add(p, q) {
    const a = (0, core_js_1.gf)(), b = (0, core_js_1.gf)(), c = (0, core_js_1.gf)(), d = (0, core_js_1.gf)(), e = (0, core_js_1.gf)(), f = (0, core_js_1.gf)(), g = (0, core_js_1.gf)(), h = (0, core_js_1.gf)(), t = (0, core_js_1.gf)();
    (0, core_js_1.Z)(a, p[1], p[0]);
    (0, core_js_1.Z)(t, q[1], q[0]);
    (0, core_js_1.M)(a, a, t);
    (0, core_js_1.A)(b, p[0], p[1]);
    (0, core_js_1.A)(t, q[0], q[1]);
    (0, core_js_1.M)(b, b, t);
    (0, core_js_1.M)(c, p[3], q[3]);
    (0, core_js_1.M)(c, c, core_js_1.D2);
    (0, core_js_1.M)(d, p[2], q[2]);
    (0, core_js_1.A)(d, d, d);
    (0, core_js_1.Z)(e, b, a);
    (0, core_js_1.Z)(f, d, c);
    (0, core_js_1.A)(g, d, c);
    (0, core_js_1.A)(h, b, a);
    (0, core_js_1.M)(p[0], e, f);
    (0, core_js_1.M)(p[1], h, g);
    (0, core_js_1.M)(p[2], g, f);
    (0, core_js_1.M)(p[3], e, h);
}
function cswap(p, q, b) {
    for (let i = 0; i < 4; i++) {
        (0, curve25519_js_1.sel25519)(p[i], q[i], b);
    }
}
function pow2523(o, i) {
    const c = (0, core_js_1.gf)();
    let a;
    for (a = 0; a < 16; a++)
        c[a] = i[a];
    for (a = 250; a >= 0; a--) {
        (0, core_js_1.S)(c, c);
        if (a !== 1)
            (0, core_js_1.M)(c, c, i);
    }
    for (a = 0; a < 16; a++)
        o[a] = c[a];
}
