/**
 * convert nears expressed as a js-number with MAX 4 decimals into a yoctos-string
 * @param n amount in near MAX 6 DECIMALS
 */
 export function ntoy(n: number) {
    let by1e6 = Math.round(n * 1e6).toString() // near * 1e6 - round
    let yoctosText = by1e6 + "0".repeat(18) //  mul by 1e18 => yoctos = near * 1e(6+18)
    return yoctosText
}

/**
 * returns amount truncated to 4 decimal places
 * @param yoctos amount expressed in yoctos
 */
export function yton(yoctos: string) {
    if (yoctos.indexOf(".") !== -1) throw new Error("a yocto string can't have a decimal point: " + yoctos)
    let negative=false;
    if (yoctos.startsWith("-")) {
        negative=true;
        yoctos = yoctos.slice(1)
    }
    let padded = yoctos.padStart(25, "0") //at least 0.xxx
    let nearsText = padded.slice(0, -24) + "." + padded.slice(-24, -20) //add decimal point. Equivalent to near=yoctos/1e24 and truncate to 4 dec places
    return Number(nearsText) * (negative?-1:1)
}
// yton from a bigInt
export function ytonb(yoctos: bigint) { return yton(yoctos.toString()) }

//yton just add decimal point, keep all decimals
export function ytonFull(str: string): string {
    let pre="";
    if (str.startsWith("-")) {
        pre="-"
        str= str.slice(1);
    }
    let result = (str + "").padStart(25, "0")
    result = result.slice(0, -24) + "." + result.slice(-24)
    return pre + result;
}
