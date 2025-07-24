"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignedTransaction = exports.createHashAndSignedTransaction = exports.createSignedTransactionResult = exports.createTransaction = exports.SCHEMA = exports.Action = exports.SignedTransaction = exports.Transaction = exports.Signature = exports.deleteAccount = exports.deleteKey = exports.addKey = exports.stake = exports.transfer = exports.functionCall = exports.deployContract = exports.createAccount = exports.IAction = exports.functionCallAccessKey = exports.fullAccessKey = exports.AccessKey = exports.AccessKeyPermission = exports.FullAccessPermission = exports.FunctionCallPermission = void 0;
const sha256_js_1 = __importDefault(require("./utils/sha256.js"));
const enums_js_1 = require("./utils/enums.js");
const serialize_js_1 = require("./utils/serialize.js");
const key_pair_js_1 = require("./utils/key-pair.js");
//import { Signer } from './signer';
class FunctionCallPermission extends enums_js_1.Assignable {
}
exports.FunctionCallPermission = FunctionCallPermission;
class FullAccessPermission extends enums_js_1.Assignable {
}
exports.FullAccessPermission = FullAccessPermission;
class AccessKeyPermission extends enums_js_1.Enum {
}
exports.AccessKeyPermission = AccessKeyPermission;
class AccessKey extends enums_js_1.Assignable {
}
exports.AccessKey = AccessKey;
function fullAccessKey() {
    return new AccessKey({ nonce: 0, permission: new AccessKeyPermission({ fullAccess: new FullAccessPermission({}) }) });
}
exports.fullAccessKey = fullAccessKey;
function functionCallAccessKey(receiverId, methodNames, allowance) {
    return new AccessKey({ nonce: 0, permission: new AccessKeyPermission({ functionCall: new FunctionCallPermission({ receiverId, allowance, methodNames }) }) });
}
exports.functionCallAccessKey = functionCallAccessKey;
class IAction extends enums_js_1.Assignable {
}
exports.IAction = IAction;
class CreateAccount extends IAction {
}
class DeployContract extends IAction {
}
class FunctionCall extends IAction {
}
class Transfer extends IAction {
}
class Stake extends IAction {
}
class AddKey extends IAction {
}
class DeleteKey extends IAction {
}
class DeleteAccount extends IAction {
}
function createAccount() {
    return new Action({ createAccount: new CreateAccount({}) });
}
exports.createAccount = createAccount;
function deployContract(code) {
    return new Action({ deployContract: new DeployContract({ code }) });
}
exports.deployContract = deployContract;
/**
 * Constructs {@link Action} instance representing contract method call.
 *
 * @param methodName the name of the method to call
 * @param args arguments to pass to method. Can be either plain JS object which gets serialized as JSON automatically
 *  or `Uint8Array` instance which represents bytes passed as is.
 * @param gas max amount of gas that method call can use
 * @param deposit amount of NEAR (in yoctoNEAR) to send together with the call
 */
function functionCall(methodName, args, gas, deposit) {
    const anyArgs = args;
    const isUint8Array = anyArgs.byteLength !== undefined && anyArgs.byteLength === anyArgs.length;
    const serializedArgs = isUint8Array ? args : Buffer.from(JSON.stringify(args));
    return new Action({ functionCall: new FunctionCall({ methodName, args: serializedArgs, gas, deposit }) });
}
exports.functionCall = functionCall;
function transfer(deposit) {
    return new Action({ transfer: new Transfer({ deposit }) });
}
exports.transfer = transfer;
function stake(stake, publicKey) {
    return new Action({ stake: new Stake({ stake, publicKey }) });
}
exports.stake = stake;
function addKey(publicKey, accessKey) {
    return new Action({ addKey: new AddKey({ publicKey, accessKey }) });
}
exports.addKey = addKey;
function deleteKey(publicKey) {
    return new Action({ deleteKey: new DeleteKey({ publicKey }) });
}
exports.deleteKey = deleteKey;
function deleteAccount(beneficiaryId) {
    return new Action({ deleteAccount: new DeleteAccount({ beneficiaryId }) });
}
exports.deleteAccount = deleteAccount;
class Signature extends enums_js_1.Assignable {
}
exports.Signature = Signature;
class Transaction extends enums_js_1.Assignable {
    encode() {
        return (0, serialize_js_1.serialize)(exports.SCHEMA, this);
    }
    static decode(bytes) {
        return (0, serialize_js_1.deserialize)(exports.SCHEMA, Transaction, bytes);
    }
}
exports.Transaction = Transaction;
class SignedTransaction extends enums_js_1.Assignable {
    encode() {
        return (0, serialize_js_1.serialize)(exports.SCHEMA, this);
    }
    static decode(bytes) {
        return (0, serialize_js_1.deserialize)(exports.SCHEMA, SignedTransaction, bytes);
    }
}
exports.SignedTransaction = SignedTransaction;
/**
 * Contains a list of the valid transaction Actions available with this API
 */
class Action extends enums_js_1.Enum {
}
exports.Action = Action;
exports.SCHEMA = new Map([
    [Signature, { kind: 'struct', fields: [
                ['keyType', 'u8'],
                ['data', [64]]
            ] }],
    [SignedTransaction, { kind: 'struct', fields: [
                ['transaction', Transaction],
                ['signature', Signature]
            ] }],
    [Transaction, { kind: 'struct', fields: [
                ['signerId', 'string'],
                ['publicKey', key_pair_js_1.PublicKey],
                ['nonce', 'u64'],
                ['receiverId', 'string'],
                ['blockHash', [32]],
                ['actions', [Action]]
            ] }],
    [key_pair_js_1.PublicKey, { kind: 'struct', fields: [
                ['keyType', 'u8'],
                ['data', [32]]
            ] }],
    [AccessKey, { kind: 'struct', fields: [
                ['nonce', 'u64'],
                ['permission', AccessKeyPermission],
            ] }],
    [AccessKeyPermission, { kind: 'enum', field: 'enum', values: [
                ['functionCall', FunctionCallPermission],
                ['fullAccess', FullAccessPermission],
            ] }],
    [FunctionCallPermission, { kind: 'struct', fields: [
                ['allowance', { kind: 'option', type: 'u128' }],
                ['receiverId', 'string'],
                ['methodNames', ['string']],
            ] }],
    [FullAccessPermission, { kind: 'struct', fields: [] }],
    [Action, { kind: 'enum', field: 'enum', values: [
                ['createAccount', CreateAccount],
                ['deployContract', DeployContract],
                ['functionCall', FunctionCall],
                ['transfer', Transfer],
                ['stake', Stake],
                ['addKey', AddKey],
                ['deleteKey', DeleteKey],
                ['deleteAccount', DeleteAccount],
            ] }],
    [CreateAccount, { kind: 'struct', fields: [] }],
    [DeployContract, { kind: 'struct', fields: [
                ['code', ['u8']]
            ] }],
    [FunctionCall, { kind: 'struct', fields: [
                ['methodName', 'string'],
                ['args', ['u8']],
                ['gas', 'u64'],
                ['deposit', 'u128']
            ] }],
    [Transfer, { kind: 'struct', fields: [
                ['deposit', 'u128']
            ] }],
    [Stake, { kind: 'struct', fields: [
                ['stake', 'u128'],
                ['publicKey', key_pair_js_1.PublicKey]
            ] }],
    [AddKey, { kind: 'struct', fields: [
                ['publicKey', key_pair_js_1.PublicKey],
                ['accessKey', AccessKey]
            ] }],
    [DeleteKey, { kind: 'struct', fields: [
                ['publicKey', key_pair_js_1.PublicKey]
            ] }],
    [DeleteAccount, { kind: 'struct', fields: [
                ['beneficiaryId', 'string']
            ] }],
]);
function createTransaction(signerId, publicKey, receiverId, nonce, actions, blockHash) {
    return new Transaction({ signerId, publicKey, nonce, receiverId, actions, blockHash });
}
exports.createTransaction = createTransaction;
class createSignedTransactionResult {
    constructor(hash, signedTransaction) {
        this.hash = hash;
        this.signedTransaction = signedTransaction;
    }
}
exports.createSignedTransactionResult = createSignedTransactionResult;
/**
 * Signs a given transaction from an account with given keys, applied to the given network
 * return HASH and the signed transaction
 * @param transaction The Transaction object to sign
 * @param keyPair The Keypair to sign the txn
 */
function createHashAndSignedTransaction(transaction, keyPair) {
    const message = (0, serialize_js_1.serialize)(exports.SCHEMA, transaction);
    const hash = new Uint8Array((0, sha256_js_1.default)(message));
    const signature = keyPair.sign(hash);
    const signedTx = new SignedTransaction({
        transaction,
        signature: new Signature({ keyType: transaction.publicKey.keyType, data: signature.signature })
    });
    return new createSignedTransactionResult(hash, signedTx);
}
exports.createHashAndSignedTransaction = createHashAndSignedTransaction;
/**
 * Signs a given transaction from an account with given keys, applied to the given network
 * @param transaction The Transaction object to sign
 * @param keyPair The Keypair to sign the txn
 */
function createSignedTransaction(transaction, keyPair) {
    let result = createHashAndSignedTransaction(transaction, keyPair);
    return result.signedTransaction;
}
exports.createSignedTransaction = createSignedTransaction;
/*export async function signTransaction(transaction: Transaction, signer: Signer, accountId?: string, networkId?: string): Promise<[Uint8Array, SignedTransaction]>;
export async function signTransaction(receiverId: string, nonce: number, actions: Action[], blockHash: Uint8Array, signer: Signer, accountId?: string, networkId?: string): Promise<[Uint8Array, SignedTransaction]>;
export async function signTransaction(...args): Promise<[Uint8Array, SignedTransaction]> {
    if (args[0].constructor === Transaction) {
        const [ transaction, signer, accountId, networkId ] = args;
        return signTransactionObject(transaction, signer, accountId, networkId);
    } else {
        const [ receiverId, nonce, actions, blockHash, signer, accountId, networkId ] = args;
        const publicKey = await signer.getPublicKey(accountId, networkId);
        const transaction = createTransaction(accountId, publicKey, receiverId, nonce, actions, blockHash);
        return signTransactionObject(transaction, signer, accountId, networkId);
    }
}
*/
