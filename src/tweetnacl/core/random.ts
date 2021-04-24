import { ByteArray } from './array.js';

const QUOTA = 1 << 16;

type randomBytesFunction = (n: number) => ByteArray;
export let randomBytes: randomBytesFunction ;

var isBrowser=new Function("return this==window");

if (isBrowser()) {
    // Browsers
    randomBytes = function(n):ByteArray {
        let v = new Uint8Array(n);
        for (let i = 0; i < n; i += QUOTA) {
            crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
        }
        return v;
    }
} 
else { // Node.js.
    let cryptoNode = require('crypto');
    randomBytes = cryptoNode.randomBytes;
}
