export declare function setRpcUrl(newUrl: string): void;
export declare function getRpcUrl(): string;
export declare function addHeader(name: string, value: string): void;
export declare function getHeaders(): Record<string, string>;
/**
 * Extracts a user-readable format from a smart-contract error result
 * converts yoctoNears to NEAR amounts
 * @param obj result.status.failure or other err objects
 * @returns
 */
export declare function formatJSONErr(obj: any): any;
export declare function jsonRpcInternal(payload: Record<string, any>): Promise<any>;
/**
 * makes a jsonRpc call with {method}
 * @param method jsonRpc method to call
 * @param jsonRpcParams string[] with parameters
 */
export declare function jsonRpc(method: string, jsonRpcParams: any): Promise<any>;
/**
 * makes a jsonRpc "query" call
 * @param {string} queryWhat : account/xx | call/contract/method
 * @param {any} params : { amount:"2020202202212"}
 */
export declare function jsonRpcQuery(queryWhat: string, params?: any): Promise<any>;
