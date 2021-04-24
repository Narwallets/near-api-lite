"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ytonFull = exports.ytonb = exports.yton = exports.ntoy = void 0;
/**
 * convert nears expressed as a js-number with MAX 4 decimals into a yoctos-string
 * @param n amount in near MAX 6 DECIMALS
 */
function ntoy(n) {
    let by1e6 = Math.round(n * 1e6).toString(); // near * 1e6 - round
    let yoctosText = by1e6 + "0".repeat(18); //  mul by 1e18 => yoctos = near * 1e(6+18)
    return yoctosText;
}
exports.ntoy = ntoy;
/**
 * returns amount truncated to 4 decimal places
 * @param yoctos amount expressed in yoctos
 */
function yton(yoctos) {
    if (yoctos.indexOf(".") !== -1)
        throw new Error("a yocto string can't have a decimal point: " + yoctos);
    let negative = false;
    if (yoctos.startsWith("-")) {
        negative = true;
        yoctos = yoctos.slice(1);
    }
    let padded = yoctos.padStart(25, "0"); //at least 0.xxx
    let nearsText = padded.slice(0, -24) + "." + padded.slice(-24, -20); //add decimal point. Equivalent to near=yoctos/1e24 and truncate to 4 dec places
    return Number(nearsText) * (negative ? -1 : 1);
}
exports.yton = yton;
// yton from a bigInt
function ytonb(yoctos) { return yton(yoctos.toString()); }
exports.ytonb = ytonb;
//yton just add decimal point, keep all decimals
function ytonFull(str) {
    let pre = "";
    if (str.startsWith("-")) {
        pre = "-";
        str = str.slice(1);
    }
    let result = (str + "").padStart(25, "0");
    result = result.slice(0, -24) + "." + result.slice(-24);
    return pre + result;
}
exports.ytonFull = ytonFull;
