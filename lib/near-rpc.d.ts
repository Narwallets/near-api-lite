import * as TX from "./transaction.js";
import BN = require('bn.js');
/**
 * sets calls & errors log level
 * @param n 0=no log, 1=info, 2=all
 */
export declare function setLogLevel(n: number): void;
export declare function lastBlockHashSeen(): Uint8Array;
export declare function lastBlockHeightSeen(): number;
export declare function bufferToHex(buffer: any): string;
export declare function decodeJsonFromResult(result: Uint8Array): string;
export declare type StateResult = {
    amount: string;
    block_hash: string;
    block_height: number;
    code_hash: string;
    locked: string;
    storage_paid_at: number;
    storage_usage: number;
};
export declare function queryAccount(accountId: string): Promise<StateResult>;
export declare function access_key(accountId: string, publicKey: string): Promise<any>;
export declare function viewRaw(contractId: string, method: string, params?: any): Promise<any>;
export declare function view(contractId: string, method: string, params?: any): Promise<any>;
export declare type BlockInfo = {
    header: {
        height: number;
        timestamp: number;
        epoch_id: string;
        next_epoch_id: string;
    };
};
export declare function latestBlock(): Promise<BlockInfo>;
export declare function block(blockId: string): Promise<BlockInfo>;
export declare function getStatus(): Promise<any>;
export declare function getGenesisConfig(): Promise<any>;
export declare function getValidators(): Promise<any>;
export declare function broadcast_tx_commit_signed(signedTransaction: TX.SignedTransaction): Promise<any>;
export declare function broadcast_tx_commit_actions(actions: TX.Action[], signerId: string, receiver: string, privateKey: string): Promise<any>;
export declare function sendYoctos(sender: string, receiver: string, amountYoctos: string, privateKey: string): Promise<any>;
export declare function send(sender: string, receiver: string, amountNear: number, privateKey: string): Promise<any>;
export declare const BN_ZERO: BN;
export declare const ONE_TGAS: BN;
export declare const ONE_NEAR: BN;
export declare function call(contractId: string, method: string, params: Uint8Array | Record<string, any>, sender: string, privateKey: string, TGas: number, attachedYoctos?: string): Promise<any>;
export declare function delete_key(pubKey: string, accountId: string, privateKey: string): Promise<any>;
export declare function delete_account(accountToDelete: string, privateKey: string, beneficiary: string): Promise<any>;
