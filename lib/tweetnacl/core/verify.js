"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports._verify_32 = exports._verify_16 = void 0;
const array_js_1 = require("./array.js");
function vn(x, xi, y, yi, n) {
    let i, d = 0;
    for (i = 0; i < n; i++)
        d |= x[xi + i] ^ y[yi + i];
    return (1 & ((d - 1) >>> 8)) - 1;
}
function _verify_16(x, xi, y, yi) {
    return vn(x, xi, y, yi, 16);
}
exports._verify_16 = _verify_16;
function _verify_32(x, xi, y, yi) {
    return vn(x, xi, y, yi, 32);
}
exports._verify_32 = _verify_32;
function verify(x, y) {
    (0, array_js_1.checkArrayTypes)(x, y);
    // Zero length arguments are considered not equal
    return x.length > 0 && y.length > 0 &&
        x.length == y.length &&
        vn(x, 0, y, 0, x.length) == 0;
}
exports.verify = verify;
