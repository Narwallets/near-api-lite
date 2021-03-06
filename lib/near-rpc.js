"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delete_account = exports.delete_key = exports.call = exports.ONE_NEAR = exports.ONE_TGAS = exports.BN_ZERO = exports.send = exports.sendYoctos = exports.broadcast_tx_commit_actions = exports.broadcast_tx_commit_signed = exports.getValidators = exports.getGenesisConfig = exports.getStatus = exports.block = exports.latestBlock = exports.view = exports.viewRaw = exports.access_key = exports.queryAccount = exports.decodeJsonFromResult = exports.bufferToHex = exports.lastBlockHeightSeen = exports.lastBlockHashSeen = exports.setLogLevel = void 0;
const json_rpc_js_1 = require("./utils/json-rpc.js");
const naclUtil = __importStar(require("./tweetnacl/util.js"));
const valid_js_1 = require("./utils/valid.js");
const key_pair_js_1 = require("./utils/key-pair.js");
const serialize_js_1 = require("./utils/serialize.js");
const TX = __importStar(require("./transaction.js"));
const bs58 = __importStar(require("./utils/bs58.js"));
const sha256 = __importStar(require("./utils/sha256.js"));
const BN = require("bn.js");
const conversion_js_1 = require("./utils/conversion.js");
//---------------------------
//-- NEAR PROTOCOL RPC CALLS
//---------------------------
let logLevel = 0;
/**
 * sets calls & errors log level
 * @param n 0=no log, 1=info, 2=all
 */
function setLogLevel(n) {
    logLevel = n;
}
exports.setLogLevel = setLogLevel;
//--helper fn
let last_block_hash;
function lastBlockHashSeen() {
    return last_block_hash;
}
exports.lastBlockHashSeen = lastBlockHashSeen;
let last_block_height;
function lastBlockHeightSeen() {
    return last_block_height;
}
exports.lastBlockHeightSeen = lastBlockHeightSeen;
//--helper fn
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
exports.bufferToHex = bufferToHex;
//--helper fn
function decodeJsonFromResult(result) {
    let text = naclUtil.encodeUTF8(result);
    if (text == "null")
        return ""; //I strongly prefer "" as alias to null (ORACLE style)
    try {
        return JSON.parse(text);
    }
    catch (ex) {
        throw Error("ERR at JSON.parse: " + text);
    }
}
exports.decodeJsonFromResult = decodeJsonFromResult;
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
async function queryAccount(accountId) {
    try {
        return await json_rpc_js_1.jsonRpcQuery("account/" + accountId);
    }
    catch (ex) {
        //intercept and make err message better for "account not found"
        const reason = ex.message.replace("while viewing", "");
        throw Error(reason);
    }
}
exports.queryAccount = queryAccount;
;
//-------------------------------
function access_key(accountId, publicKey) {
    return json_rpc_js_1.jsonRpcQuery(`access_key/${accountId}/${publicKey}`);
}
exports.access_key = access_key;
;
//-------------------------------
function viewRaw(contractId, method, params) {
    let encodedParams = undefined;
    if (params)
        encodedParams = bs58.encode(Buffer.from(JSON.stringify(params)));
    return json_rpc_js_1.jsonRpcQuery("call/" + contractId + "/" + method, encodedParams);
}
exports.viewRaw = viewRaw;
async function view(contractId, method, params) {
    const data = await viewRaw(contractId, method, params);
    if (data && data.block_height)
        last_block_height = data.block_height;
    return decodeJsonFromResult(data.result);
}
exports.view = view;
function latestBlock() {
    return json_rpc_js_1.jsonRpc('block', { finality: "optimistic" });
}
exports.latestBlock = latestBlock;
;
function block(blockId) {
    return json_rpc_js_1.jsonRpc('block', { block_id: blockId });
}
exports.block = block;
;
function getStatus() {
    return json_rpc_js_1.jsonRpc('status', [null]);
}
exports.getStatus = getStatus;
;
function getGenesisConfig() {
    return json_rpc_js_1.jsonRpc('EXPERIMENTAL_genesis_config', [null]);
}
exports.getGenesisConfig = getGenesisConfig;
;
//---------------------------------
//---- VALIDATORS & STAKING POOLS -
//---------------------------------
function getValidators() {
    return json_rpc_js_1.jsonRpc('validators', [null]);
}
exports.getValidators = getValidators;
;
//-------------------------------
function broadcast_tx_commit_signed(signedTransaction) {
    const borshEncoded = signedTransaction.encode();
    const b64Encoded = Buffer.from(borshEncoded).toString('base64');
    return json_rpc_js_1.jsonRpc('broadcast_tx_commit', [b64Encoded]);
}
exports.broadcast_tx_commit_signed = broadcast_tx_commit_signed;
;
//-------------------------------
async function broadcast_tx_commit_actions(actions, signerId, receiver, privateKey) {
    const keyPair = key_pair_js_1.KeyPairEd25519.fromString(privateKey);
    const publicKey = keyPair.getPublicKey();
    const accessKey = await access_key(signerId, publicKey.toString());
    if (accessKey.permission !== 'FullAccess')
        throw Error(`The key is not full access for account '${signerId}'`);
    // converts a recent block hash into an array of bytes 
    // this hash was retrieved earlier when creating the accessKey (Line 26)
    // this is required to prove the tx was recently constructed (within 24hrs)
    last_block_hash = serialize_js_1.decodeBase58(accessKey.block_hash);
    last_block_height = accessKey.block_height;
    // each transaction requires a unique number or nonce
    // this is created by taking the current nonce and incrementing it
    const nonce = ++accessKey.nonce;
    const transaction = TX.createTransaction(signerId, publicKey, receiver, nonce, actions, last_block_hash);
    const serializedTx = serialize_js_1.serialize(TX.SCHEMA, transaction);
    const serializedTxHash = new Uint8Array(sha256.hash(serializedTx));
    const signature = keyPair.sign(serializedTxHash);
    const signedTransaction = new TX.SignedTransaction({
        transaction: transaction,
        signature: new TX.Signature({
            keyType: transaction.publicKey.keyType,
            data: signature.signature
        })
    });
    const result = await broadcast_tx_commit_signed(signedTransaction);
    if (result.status && result.status.Failure) {
        if (logLevel >= 2)
            console.error(JSON.stringify(result));
        console.error(getLogsAndErrorsFromReceipts(result));
        throw Error(json_rpc_js_1.formatJSONErr(result.status.Failure));
    }
    if (logLevel >= 1)
        console.log(getLogsAndErrorsFromReceipts(result));
    if (result.status && result.status.SuccessValue === "") { //returned "void"
        return undefined; //void
    }
    if (result.status && result.status.SuccessValue) { //some json result value, can by a string|true/false|a number
        const sv = naclUtil.encodeUTF8(naclUtil.decodeBase64(result.status.SuccessValue));
        if (logLevel > 0)
            console.log("result.status.SuccessValue:", sv);
        return JSON.parse(sv);
    }
    console.error(JSON.stringify(result));
    throw Error("!result.status Failure or SuccessValue");
}
exports.broadcast_tx_commit_actions = broadcast_tx_commit_actions;
//-------------------------------
function getLogsAndErrorsFromReceipts(txResult) {
    let result = [];
    try {
        for (let ro of txResult.receipts_outcome) {
            //get logs
            for (let logLine of ro.outcome.logs) {
                result.push(logLine);
            }
            //check status.Failure
            if (ro.outcome.status.Failure) {
                result.push(JSON.stringify(ro.outcome.status.Failure));
            }
        }
    }
    catch (ex) {
        result.push("internal error parsing result outcome");
    }
    finally {
        return result.join('\n');
    }
}
//-------------------------------
function sendYoctos(sender, receiver, amountYoctos, privateKey) {
    const actions = [TX.transfer(new BN.BN(amountYoctos))];
    return broadcast_tx_commit_actions(actions, sender, receiver, privateKey);
}
exports.sendYoctos = sendYoctos;
//-------------------------------
function send(sender, receiver, amountNear, privateKey) {
    if (isNaN(amountNear) || amountNear <= 0)
        throw Error("invalid amount");
    const actions = [TX.transfer(new BN(conversion_js_1.ntoy(amountNear)))];
    return broadcast_tx_commit_actions(actions, sender, receiver, privateKey);
}
exports.send = send;
//-------------------------------
//-- CALL CONTRACT METHOD -------
//-------------------------------
exports.BN_ZERO = new BN("0");
exports.ONE_TGAS = new BN("1" + "0".repeat(12));
exports.ONE_NEAR = new BN("1" + "0".repeat(24));
function call(contractId, method, params, sender, privateKey, TGas, attachedYoctos) {
    if (logLevel > 0)
        console.log(`call ${contractId} ${method} ${params instanceof Uint8Array ? "[Uint8Array]" : JSON.stringify(params)} --accountId ${sender} -gas:${TGas} --amount:${conversion_js_1.yton(attachedYoctos || "0")}`);
    return broadcast_tx_commit_actions([TX.functionCall(method, params, new BN(TGas.toString() + "0".repeat(12)), new BN(attachedYoctos || "0"))], sender, contractId, privateKey);
}
exports.call = call;
//-------------------------------
function delete_key(pubKey, accountId, privateKey) {
    const actions = [TX.deleteKey(key_pair_js_1.PublicKey.fromString(pubKey))];
    return broadcast_tx_commit_actions(actions, accountId, accountId, privateKey);
}
exports.delete_key = delete_key;
//-------------------------------
function delete_account(accountToDelete, privateKey, beneficiary) {
    if (!valid_js_1.isValidAccountID(accountToDelete))
        throw Error("Delete account: invalid account name to delete");
    if (!valid_js_1.isValidAccountID(beneficiary))
        throw Error("Delete account: invalid beneficiary account name");
    const actions = [TX.deleteAccount(beneficiary)];
    return broadcast_tx_commit_actions(actions, accountToDelete, accountToDelete, privateKey);
}
exports.delete_account = delete_account;
