"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inv25519 = exports.unpack25519 = exports.par25519 = exports.neq25519 = exports.pack25519 = exports.sel25519 = exports.set25519 = void 0;
const array_js_1 = require("./array.js");
const verify_js_1 = require("./verify.js");
const core_js_1 = require("./core.js");
function set25519(r, a) {
    for (let i = 0; i < 16; i++)
        r[i] = a[i] | 0;
}
exports.set25519 = set25519;
function car25519(o) {
    let i, v, c = 1;
    for (i = 0; i < 16; i++) {
        v = o[i] + c + 65535;
        c = Math.floor(v / 65536);
        o[i] = v - c * 65536;
    }
    o[0] += c - 1 + 37 * (c - 1);
}
function sel25519(p, q, b) {
    let t, c = ~(b - 1);
    for (let i = 0; i < 16; i++) {
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
    }
}
exports.sel25519 = sel25519;
function pack25519(o, n) {
    const m = (0, core_js_1.gf)(), t = (0, core_js_1.gf)();
    let i, j, b;
    for (i = 0; i < 16; i++)
        t[i] = n[i];
    car25519(t);
    car25519(t);
    car25519(t);
    for (j = 0; j < 2; j++) {
        m[0] = t[0] - 0xffed;
        for (i = 1; i < 15; i++) {
            m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1);
            m[i - 1] &= 0xffff;
        }
        m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1);
        b = (m[15] >> 16) & 1;
        m[14] &= 0xffff;
        sel25519(t, m, 1 - b);
    }
    for (i = 0; i < 16; i++) {
        o[2 * i] = t[i] & 0xff;
        o[2 * i + 1] = t[i] >> 8;
    }
}
exports.pack25519 = pack25519;
function neq25519(a, b) {
    const c = (0, array_js_1.ByteArray)(32), d = (0, array_js_1.ByteArray)(32);
    pack25519(c, a);
    pack25519(d, b);
    return (0, verify_js_1._verify_32)(c, 0, d, 0);
}
exports.neq25519 = neq25519;
function par25519(a) {
    const d = (0, array_js_1.ByteArray)(32);
    pack25519(d, a);
    return d[0] & 1;
}
exports.par25519 = par25519;
function unpack25519(o, n) {
    for (let i = 0; i < 16; i++)
        o[i] = n[2 * i] + (n[2 * i + 1] << 8);
    o[15] &= 0x7fff;
}
exports.unpack25519 = unpack25519;
function inv25519(o, i) {
    const c = (0, core_js_1.gf)();
    let a;
    for (a = 0; a < 16; a++)
        c[a] = i[a];
    for (a = 253; a >= 0; a--) {
        (0, core_js_1.S)(c, c);
        if (a !== 2 && a !== 4)
            (0, core_js_1.M)(c, c, i);
    }
    for (a = 0; a < 16; a++)
        o[a] = c[a];
}
exports.inv25519 = inv25519;
