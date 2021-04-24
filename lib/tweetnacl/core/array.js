"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkArrayTypes = exports.NumArray = exports.IntArray = exports.WordArray = exports.HalfArray = exports.ByteArray = void 0;
function ByteArray(n) {
    return new Uint8Array(n);
}
exports.ByteArray = ByteArray;
function HalfArray(n) {
    return new Uint16Array(n);
}
exports.HalfArray = HalfArray;
function WordArray(n) {
    return new Uint32Array(n);
}
exports.WordArray = WordArray;
function IntArray(n) {
    return new Int32Array(n);
}
exports.IntArray = IntArray;
function NumArray(n) {
    return new Float64Array(n);
}
exports.NumArray = NumArray;
function checkArrayTypes(...arrays) {
    for (const array of arrays) {
        if (!(array instanceof Uint8Array)) {
            throw new TypeError('unexpected type, use ByteArray');
        }
    }
}
exports.checkArrayTypes = checkArrayTypes;
