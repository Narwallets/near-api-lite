import { jsonRpc, jsonRpcQuery, formatJSONErr } from "./utils/json-rpc.js"
import * as naclUtil from "./tweetnacl/util.js"
import {isValidAccountID} from "./utils/valid.js";
import { KeyPairEd25519, PublicKey } from "./utils/key-pair.js"
import { serialize, base_decode } from "./utils/serialize.js"
import * as TX from "./transaction.js"

import * as bs58 from "./utils/bs58.js";
import * as sha256 from "./utils/sha256.js"
import BN = require('bn.js');
import { ntoy, yton } from "./utils/conversion.js";

//---------------------------
//-- NEAR PROTOCOL RPC CALLS
//---------------------------

let logLevel =0;
/// 0=no log, 1=info, 2=all
export function setLogLevel(n:number) {
    logLevel=n;
}


//--helper fn
let last_block_hash: Uint8Array;
export function lastBlockHashSeen(): Uint8Array {
    return last_block_hash
}

let last_block_height: number;
export function lastBlockHeightSeen(): number {
    return last_block_height
}


//--helper fn
export function bufferToHex(buffer: any) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
//--helper fn
export function decodeJsonFromResult(result: Uint8Array): string {
    let text = naclUtil.encodeUTF8(result)
    if (text == "null") return "" //I strongly prefer "" as alias to null (ORACLE style)
    try {
        return JSON.parse(text);
    }
    catch (ex) {
        throw Error("ERR at JSON.parse: " + text)
    }
}



//-------------------------
//-- Query Account State
//-------------------------
export type StateResult = {
    amount: string; //"27101097909936818225912322116"
    block_hash: string; //"DoTW1Tpp3TpC9egBe1xFJbbEb6vYxbT33g9GHepiYL5a"
    block_height: number; //20046823
    code_hash: string; //"11111111111111111111111111111111"
    locked: string; //"0"
    storage_paid_at: number; //0
    storage_usage: number; // 2080
}

/* 
near.state example result
result: {
    amount: "27101097909936818225912322116"
    block_hash: "DoTW1Tpp3TpC9egBe1xFJbbEb6vYxbT33g9GHepiYL5a"
    block_height: 20046823
    code_hash: "11111111111111111111111111111111"
    locked: "0"
    storage_paid_at: 0
    storage_usage: 2080
    }
*/

export async function queryAccount(accountId: string): Promise<StateResult> {
    try {
        return await jsonRpcQuery("account/" + accountId) as Promise<StateResult>
    }
    catch (ex) {
        //intercept and make err message better for "account not found"
        const reason = ex.message.replace("while viewing", "")
        throw Error(reason)
    }
};

//-------------------------------
export function access_key(accountId: string, publicKey: string): Promise<any> {
    return jsonRpcQuery(`access_key/${accountId}/${publicKey}`) as Promise<any>
};

//-------------------------------
export function viewRaw(contractId: string, method: string, params?: any): Promise<any> {
    let encodedParams = undefined;
    if (params) encodedParams = bs58.encode(Buffer.from(JSON.stringify(params)));
    return jsonRpcQuery("call/" + contractId + "/" + method, encodedParams);
}
export async function view(contractId: string, method: string, params?: any): Promise<any> {
    const data = await viewRaw(contractId, method, params);
    if (data && data.block_height) last_block_height = data.block_height;
    return decodeJsonFromResult(data.result)
}

//--------------------
//---- GENERAL STATUS
//--------------------
export type BlockInfo = {
    header: {
        height: number
        timestamp: number;
        epoch_id: string;
        next_epoch_id: string;
    }
}
export function latestBlock(): Promise<BlockInfo> {
    return jsonRpc('block',{finality:"optimistic"}) 
};
export function block(blockId:string): Promise<BlockInfo> {
    return jsonRpc('block', {block_id:blockId})
};
export function getStatus(): Promise<any> {
    return jsonRpc('status', [null]) as Promise<any>
};
export function getGenesisConfig(): Promise<any> {
    return jsonRpc('EXPERIMENTAL_genesis_config', [null]) as Promise<any>
};


//---------------------------------
//---- VALIDATORS & STAKING POOLS -
//---------------------------------
export function getValidators(): Promise<any> {
    return jsonRpc('validators', [null]) as Promise<any>
};


//-------------------------------
export function broadcast_tx_commit_signed(signedTransaction: TX.SignedTransaction): Promise<any> {
    const borshEncoded = signedTransaction.encode();
    const b64Encoded = Buffer.from(borshEncoded).toString('base64')
    return jsonRpc('broadcast_tx_commit', [b64Encoded]) as Promise<any>
};

//-------------------------------
export async function broadcast_tx_commit_actions(actions: TX.Action[], signerId: string, receiver: string, privateKey: string): Promise<any> {

    const keyPair = KeyPairEd25519.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();

    const accessKey = await access_key(signerId, publicKey.toString());
    if (accessKey.permission !== 'FullAccess') throw Error(`The key is not full access for account '${signerId}'`)

    // converts a recent block hash into an array of bytes 
    // this hash was retrieved earlier when creating the accessKey (Line 26)
    // this is required to prove the tx was recently constructed (within 24hrs)
    last_block_hash = base_decode(accessKey.block_hash);
    last_block_height=accessKey.block_height;

    // each transaction requires a unique number or nonce
    // this is created by taking the current nonce and incrementing it
    const nonce = ++accessKey.nonce;

    const transaction = TX.createTransaction(
        signerId,
        publicKey,
        receiver,
        nonce,
        actions,
        last_block_hash
    )

    const serializedTx = serialize(TX.SCHEMA, transaction);
    const serializedTxHash = new Uint8Array(sha256.hash(serializedTx));
    const signature = keyPair.sign(serializedTxHash)

    const signedTransaction = new TX.SignedTransaction({
        transaction: transaction,
        signature: new TX.Signature({
            keyType: transaction.publicKey.keyType,
            data: signature.signature
        })
    });

    const result = await broadcast_tx_commit_signed(signedTransaction)

    if (result.status && result.status.Failure) {
        console.error(JSON.stringify(result))
        console.error(getLogsAndErrorsFromReceipts(result))
        throw Error(formatJSONErr(result.status.Failure))
    }

    if (logLevel>1) console.log(getLogsAndErrorsFromReceipts(result));

    if (result.status && result.status.SuccessValue==="") { //returned "void"
        return undefined; //void
    }

    if (result.status && result.status.SuccessValue) { //some json result value, can by a string|true/false|a number
        const sv = naclUtil.encodeUTF8(naclUtil.decodeBase64(result.status.SuccessValue))
        if (logLevel>0) console.log("result.status.SuccessValue:", sv);
        return JSON.parse(sv)
    }

    console.error(JSON.stringify(result))
    throw Error("!result.status Failure or SuccessValue")    
}

//-------------------------------
function getLogsAndErrorsFromReceipts(txResult: any) {
    let result = []
    try {
        for (let ro of txResult.receipts_outcome) {
            //get logs
            for (let logLine of ro.outcome.logs) {
                result.push(logLine)
            }
            //check status.Failure
            if (ro.outcome.status.Failure) {
                result.push(formatJSONErr(ro.outcome.status.Failure))
            }
        }
    } catch (ex) {
        result.push("internal error parsing result outcome")
    }
    finally {
        return result.join('\n')
    }
}

//-------------------------------
export function sendYoctos(sender: string, receiver: string, amountYoctos: string, privateKey: string): Promise<any> {
    const actions = [TX.transfer(new BN.BN(amountYoctos))]
    return broadcast_tx_commit_actions(actions, sender, receiver, privateKey)
}

//-------------------------------
export function send(sender: string, receiver: string, amountNear: number, privateKey: string): Promise<any> {
    if (isNaN(amountNear) || amountNear <= 0) throw Error("invalid amount")
    const actions = [TX.transfer(new BN(ntoy(amountNear)))]
    return broadcast_tx_commit_actions(actions, sender, receiver, privateKey)
}


//-------------------------------
//-- CALL CONTRACT METHOD -------
//-------------------------------
export const BN_ZERO = new BN("0")
export const ONE_TGAS = new BN("1" + "0".repeat(12));
export const ONE_NEAR = new BN("1" + "0".repeat(24));

export function call(
    contractId: string,
    method: string,
    params: any,
    sender: string,
    privateKey: string,
    TGas: number,
    attachedYoctos?: string): Promise<any> {

    if (logLevel>0) console.log(`call ${contractId} ${method} ${JSON.stringify(params)} --accountId ${sender} -gas:${TGas} --amount:${yton(attachedYoctos||"0")}`);

    return broadcast_tx_commit_actions(
        [TX.functionCall(method, params, new BN(TGas.toString() + "0".repeat(12)), new BN(attachedYoctos||"0"))],
        sender, contractId, privateKey)
}

//-------------------------------
export function delete_key(pubKey: string, accountId:string, privateKey: string): Promise<any> {

    const actions = [TX.deleteKey(PublicKey.fromString(pubKey))]
    return broadcast_tx_commit_actions(actions, accountId, accountId, privateKey)

}

//-------------------------------
export function delete_account(accountToDelete: string, privateKey: string, beneficiary: string): Promise<any> {

    if (!isValidAccountID(accountToDelete)) throw Error("Delete account: invalid account name to delete")
    if (!isValidAccountID(beneficiary)) throw Error("Delete account: invalid beneficiary account name")

    const actions = [TX.deleteAccount(beneficiary)]
    return broadcast_tx_commit_actions(actions, accountToDelete, accountToDelete, privateKey)

}

