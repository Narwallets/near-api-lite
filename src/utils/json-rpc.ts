import fetch from 'node-fetch'

import * as naclUtil from "../tweetnacl/util.js";
import { ytonFull } from "./conversion.js";

let rpcUrl: string = "https://rpc.mainnet.near.org/"

export function setRpcUrl(newUrl: string) {
    rpcUrl = newUrl;
}

const fetchHeaders: Record<string, string> = { 'Content-type': 'application/json; charset=utf-8' }
export function addHeader(name: string, value: string) {
    fetchHeaders[name] = value
}
export function getHeaders() {
    return fetchHeaders;
}

/**
 * Extracts a user-readable format from a smart-contract error result
 * converts yoctoNears to NEAR amounts
 * @param obj result.status.failure or other err objects
 * @returns 
 */
export function formatJSONErr(obj: any): any {

    let text = JSON.stringify(obj)
    text = text.replace(/{/g, " ")
    text = text.replace(/}/g, " ")
    text = text.replace(/"/g, "")

    //---------
    //try some enhancements
    //---------
    //convert yoctoNEAR to near
    const largeNumbersFound = text.match(/\d{14,50}/g)
    if (largeNumbersFound) {
        for (const matches of largeNumbersFound) {
            const parts = matches.split(" ")
            const yoctoString = parts.pop() || ""
            if (yoctoString.length >= 20) {
                // convert to NEAR
                text = text.replace(new RegExp(yoctoString, "g"), ytonFull(yoctoString))
            }
        }
    }

    //if panicked-at: return relevant info only
    //debug: console.error(text); //show info in the console before removing extra info
    const KEY = "panicked at "
    const kl = KEY.length
    let n = text.indexOf(KEY)
    if (n > 0 && n < text.length - kl - 5) {
        const i = text.indexOf("'", n + kl + 4)
        const cut = text.slice(n + kl, i)
        if (cut.trim().length > 5) {
            //debug: console.error(text.slice(n, i + 80)) //show info in the console before removing extra info
            text = "panicked at: " + cut;
        }
    }

    return text
}

let id = 0
export async function jsonRpcInternal(payload: Record<string, any>): Promise<any> {

    try {
        const rpcOptions = {
            body: JSON.stringify(payload),
            method: "POST",
            headers: { 'Content-type': 'application/json; charset=utf-8' }
        }

        let retries = 0;
        while (true) {
            let errMsg = undefined;
            let fetchResult = undefined;
            let response = undefined;
            let mustRetry: boolean = false;
            try{
                fetchResult = await fetch(rpcUrl, rpcOptions);
                response = await fetchResult.json()
            } catch(ex){
                errMsg = ex.message || JSON.stringify(ex);
            }
            if (errMsg) {
                mustRetry = errMsg.indexOf("EAI_AGAIN")!=-1
            }
            else  {
                if (!fetchResult) {
                    throw new Error(rpcUrl + " fetchResult is falsey")
                }
                if (!fetchResult.ok) {
                    throw new Error(rpcUrl + " " + fetchResult.status + " " + fetchResult.statusText)
                }
                let error = response.error
                if (!error && response.result && response.result.error) {
                    if (response.result.logs && response.result.logs.length) {
                        console.log("response.result.logs:", response.result.logs);
                    }
                    error = {
                        message: response.result.error
                    }
                }
                if (error) {
                    const formattedJsonErr = formatJSONErr(error);
                    if (error.data === 'Timeout' || formattedJsonErr.indexOf('Timeout error') != -1) {
                        mustRetry = true
                        errMsg = 'jsonRpc has timed out'
                    }
                    else {
                        throw new Error("Error: " + formattedJsonErr);
                    }
                }
                if (!response.result) {
                    console.log("response.result=",response.result)
                }
                return response.result;
            }

            if (mustRetry) {
                if (retries<3){
                    retries++;
                    console.error("RETRY #",retries,"cause",errMsg);
                    continue;
                }
                else {
                    throw new Error(errMsg + " (and max retries reached)")
                }
            }
        }
    }
    catch (ex) {
        // add rpc url to err info
        throw new Error(ex.message + " (" + rpcUrl + ")")
    }
}
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
export async function jsonRpc(method: string, jsonRpcParams: any): Promise<any> {
    const payload = {
        method: method,
        params: jsonRpcParams,
        id: ++id,
        jsonrpc: "2.0"
    }
    return jsonRpcInternal(payload);
}

/**
 * makes a jsonRpc "query" call
 * @param {string} queryWhat : account/xx | call/contract/method
 * @param {any} params : { amount:"2020202202212"}
 */
export async function jsonRpcQuery(queryWhat: string, params?: any): Promise<any> {
    if (typeof params == "object" && Object.keys(params).length == 0) { params = undefined }
    let queryParams = [queryWhat, params || ""] //params for the fn call - something - the jsonrpc call fail if there's a single item in the array
    return await jsonRpc("query", queryParams);
}
