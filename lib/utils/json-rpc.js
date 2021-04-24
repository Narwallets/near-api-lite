"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonRpcQuery = exports.jsonRpc = exports.jsonRpcInternal = exports.formatJSONErr = exports.ytonFull = exports.getHeaders = exports.addHeader = exports.setRpcUrl = void 0;
if (!globalThis.fetch) {
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
}
let rpcUrl = "https://rpc.mainnet.near.org/";
function setRpcUrl(newUrl) {
    rpcUrl = newUrl;
}
exports.setRpcUrl = setRpcUrl;
const fetchHeaders = { 'Content-type': 'application/json; charset=utf-8' };
function addHeader(name, value) {
    fetchHeaders[name] = value;
}
exports.addHeader = addHeader;
function getHeaders() {
    return fetchHeaders;
}
exports.getHeaders = getHeaders;
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
function formatJSONErr(obj) {
    let text = JSON.stringify(obj);
    text = text.replace(/{/g, " ");
    text = text.replace(/}/g, " ");
    text = text.replace(/"/g, "");
    //---------
    //try some enhancements
    //---------
    //convert yoctoNEAR to near
    const largeNumbersFound = text.match(/\d{14,50}/g);
    if (largeNumbersFound) {
        for (const matches of largeNumbersFound) {
            const parts = matches.split(" ");
            const yoctoString = parts.pop() || "";
            if (yoctoString.length >= 20) {
                // convert to NEAR
                text = text.replace(new RegExp(yoctoString, "g"), ytonFull(yoctoString));
            }
        }
    }
    //if panicked-at: show relevant info only
    console.error(text); //show info in the console before removing extra info
    const KEY = "panicked at ";
    const kl = KEY.length;
    let n = text.indexOf(KEY);
    if (n > 0 && n < text.length - kl - 5) {
        const i = text.indexOf("'", n + kl + 4);
        const cut = text.slice(n + kl, i);
        if (cut.trim().length > 5) {
            console.error(text.slice(n, i + 80)); //show info in the console before removing extra info
            text = "panicked at: " + cut;
        }
    }
    return text;
}
exports.formatJSONErr = formatJSONErr;
let id = 0;
async function jsonRpcInternal(payload) {
    try {
        const rpcOptions = {
            body: JSON.stringify(payload),
            method: "POST",
            headers: { 'Content-type': 'application/json; charset=utf-8' }
        };
        let timeoutRetries = 0;
        while (true) {
            let fetchResult = await fetch(rpcUrl, rpcOptions);
            let response = await fetchResult.json();
            if (!fetchResult.ok)
                throw new Error(rpcUrl + " " + fetchResult.status + " " + fetchResult.statusText);
            let error = response.error;
            if (!error && response.result && response.result.error) {
                if (response.result.logs && response.result.logs.length) {
                    console.log("response.result.logs:", response.result.logs);
                }
                error = {
                    message: response.result.error
                };
            }
            if (error) {
                const errorMessage = formatJSONErr(error);
                if (error.data === 'Timeout' || errorMessage.indexOf('Timeout error') != -1) {
                    const err = new Error('jsonRpc has timed out');
                    if (timeoutRetries < 3) {
                        timeoutRetries++;
                        console.error(err.message, "RETRY #", timeoutRetries);
                        continue;
                    }
                    err.name = 'TimeoutError';
                    throw err;
                }
                else {
                    throw new Error("Error: " + errorMessage);
                }
            }
            if (!response.result) {
                console.log("response.result=", response.result);
            }
            return response.result;
        }
    }
    catch (ex) {
        //add rpc url to err info
        throw new Error(ex.message + " (" + rpcUrl + ")");
    }
}
exports.jsonRpcInternal = jsonRpcInternal;
// if (!response.ok) {
//     if (response.status === 503) {
//         console.warn(`Retrying HTTP request for ${url} as it's not available now`);
//         return null;
//     }
//     throw createError(response.status, await response.text());
// }
//     return response;
// } catch (error) {
//     if (error.toString().includes('FetchError')) {
//         console.warn(`Retrying HTTP request for ${url} because of error: ${error}`);
//         return null;
//     }
//     throw error;
// }
/**
 * makes a jsonRpc call with {method}
 * @param method jsonRpc method to call
 * @param jsonRpcParams string[] with parameters
 */
async function jsonRpc(method, jsonRpcParams) {
    const payload = {
        method: method,
        params: jsonRpcParams,
        id: ++id,
        jsonrpc: "2.0"
    };
    return jsonRpcInternal(payload);
}
exports.jsonRpc = jsonRpc;
/**
 * makes a jsonRpc "query" call
 * @param {string} queryWhat : account/xx | call/contract/method
 * @param {any} params : { amount:"2020202202212"}
 */
async function jsonRpcQuery(queryWhat, params) {
    if (typeof params == "object" && Object.keys(params).length == 0) {
        params = undefined;
    }
    let queryParams = [queryWhat, params || ""]; //params for the fn call - something - the jsonrpc call fail if there's a single item in the array
    return await jsonRpc("query", queryParams);
}
exports.jsonRpcQuery = jsonRpcQuery;
