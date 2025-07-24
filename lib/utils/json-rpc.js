"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonRpcQuery = exports.jsonRpc = exports.jsonRpcInternal = exports.formatJSONErr = exports.getHeaders = exports.addHeader = exports.getRpcUrl = exports.setRpcUrl = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const conversion_js_1 = require("./conversion.js");
let rpcUrl = "https://free.rpc.fastnear.com/";
function setRpcUrl(newUrl) {
    rpcUrl = newUrl;
}
exports.setRpcUrl = setRpcUrl;
function getRpcUrl() {
    return rpcUrl;
}
exports.getRpcUrl = getRpcUrl;
const fetchHeaders = { 'Content-type': 'application/json; charset=utf-8' };
function addHeader(name, value) {
    fetchHeaders[name] = value;
}
exports.addHeader = addHeader;
function getHeaders() {
    return fetchHeaders;
}
exports.getHeaders = getHeaders;
/**
 * Extracts a user-readable format from a smart-contract error result
 * converts yoctoNears to NEAR amounts
 * @param obj result.status.failure or other err objects
 * @returns
 */
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
                text = text.replace(new RegExp(yoctoString, "g"), (0, conversion_js_1.ytonFull)(yoctoString));
            }
        }
    }
    //if panicked-at: return relevant info only
    //debug: console.error(text); //show info in the console before removing extra info
    const KEY = "panicked at ";
    const kl = KEY.length;
    let n = text.indexOf(KEY);
    if (n > 0 && n < text.length - kl - 5) {
        const i = text.indexOf("'", n + kl + 4);
        const cut = text.slice(n + kl, i);
        if (cut.trim().length > 5) {
            //debug: console.error(text.slice(n, i + 80)) //show info in the console before removing extra info
            text = "panicked at: " + cut;
        }
    }
    return text;
}
exports.formatJSONErr = formatJSONErr;
// RATE LIMITING AND RETRIES CONFIGURATION
const MIN_RPC_CALL_INTERVAL_MS = 250; // minimum interval between RPC calls in milliseconds
let lastRpcCall = Date.now() - MIN_RPC_CALL_INTERVAL_MS; // timestamp of last RPC call
// Compute sleep time for 429 responses with exponential backoff and header hints
function compute429SleepTime(fetchResult, retry429Count) {
    let minSleepTime = 250 + 500 * (retry429Count - 1);
    let sleepTime = 250 * Math.pow(2, retry429Count - 1);
    try {
        const retryAfter = fetchResult.headers.get('Retry-After');
        const rateLimitReset = fetchResult.headers.get('X-RateLimit-Reset');
        const rateLimitRetryAfter = fetchResult.headers.get('X-RateLimit-Retry-After-Seconds');
        if (retryAfter && retryAfter !== '0') {
            const secs = parseInt(retryAfter, 10);
            if (!isNaN(secs)) {
                sleepTime = secs * 1000;
            }
        }
        else if (rateLimitRetryAfter && rateLimitRetryAfter !== '0') {
            sleepTime = parseInt(rateLimitRetryAfter, 10) * 1000;
        }
        else if (rateLimitReset) {
            const resetTime = parseInt(rateLimitReset, 10) * 1000;
            sleepTime = Math.max(0, resetTime - Date.now());
        }
    }
    catch (e) {
        console.error('Error computing sleep time:', e);
    }
    return Math.min(Math.max(sleepTime, minSleepTime), 30000);
}
// Sleep utility for retries
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Enhanced jsonRpcInternal with rate limiting, 429 & timeout retries
async function jsonRpcInternal(payload) {
    let fetchResult = null;
    try {
        const rpcOptions = {
            body: JSON.stringify(payload),
            method: 'POST',
            headers: { ...fetchHeaders }
        };
        // ensure minimum interval between calls
        const elapsedMs = Date.now() - lastRpcCall;
        if (elapsedMs < MIN_RPC_CALL_INTERVAL_MS) {
            await sleep(MIN_RPC_CALL_INTERVAL_MS - elapsedMs);
        }
        let timeoutOccurred = false;
        let timeoutRetries = 0;
        let retry429Count = 0;
        let accountDoesNotExistsRetries = 0;
        while (true) {
            timeoutOccurred = false;
            lastRpcCall = Date.now();
            fetchResult = await (0, node_fetch_1.default)(rpcUrl, rpcOptions);
            if (fetchResult.status === 429) {
                retry429Count++;
                if (retry429Count > 10) {
                    throw new Error(`${rpcUrl} ${fetchResult.status} ${fetchResult.statusText}`);
                }
                const delay = compute429SleepTime(fetchResult, retry429Count);
                console.error('429 too many requests, sleeping', `${delay}ms`, 'RETRY #', retry429Count);
                await sleep(delay);
                continue;
            }
            else if (fetchResult.status === 408) {
                timeoutOccurred = true;
            }
            else {
                const responseJson = await fetchResult.json();
                if (!fetchResult.ok) {
                    throw new Error(`${fetchResult.status} ${fetchResult.statusText}`);
                }
                let error = responseJson.error;
                if (!error && responseJson.result && responseJson.result.error) {
                    if (responseJson.result.logs && responseJson.result.logs.length) {
                        console.log('response.result.logs:', responseJson.result.logs);
                    }
                    error = { message: responseJson.result.error, data: undefined };
                }
                if (error) {
                    const errorMessage = formatJSONErr(error);
                    if (error.data === 'Timeout' || errorMessage.includes('Timeout error')) {
                        timeoutOccurred = true;
                    }
                    else if (!rpcUrl.includes('mainnet') && errorMessage.includes('does not exist') && accountDoesNotExistsRetries < 2) {
                        accountDoesNotExistsRetries++;
                        await sleep(300);
                        continue;
                    }
                    else {
                        throw new Error(`Error: ${errorMessage}`);
                    }
                }
                else {
                    if (!responseJson.result) {
                        console.log('response.result=', responseJson.result);
                    }
                    return responseJson.result;
                }
            }
            if (timeoutOccurred) {
                const err = new Error('jsonRpc has timed out');
                if (timeoutRetries < 5) {
                    timeoutRetries++;
                    console.error(err.message, 'RETRY #', timeoutRetries);
                    continue;
                }
                err.name = 'TimeoutError';
                throw err;
            }
        }
    }
    catch (ex) {
        console.error('Err status', fetchResult === null || fetchResult === void 0 ? void 0 : fetchResult.status);
        throw new Error(`${ex.message} (${rpcUrl})`);
    }
}
exports.jsonRpcInternal = jsonRpcInternal;
// Internal JSON-RPC ID counter
let id = 0;
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
