"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
const QUOTA = 1 << 16;
var isBrowser = new Function("return this==window");
if (isBrowser()) {
    // Browsers
    exports.randomBytes = function (n) {
        let v = new Uint8Array(n);
        for (let i = 0; i < n; i += QUOTA) {
            crypto.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
        }
        return v;
    };
}
else { // Node.js.
    let cryptoNode = require('crypto');
    exports.randomBytes = cryptoNode.randomBytes;
}
