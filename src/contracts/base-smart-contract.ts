import * as near from '../near-rpc.js';
import { deployContract } from '../transaction.js';

//-----------------------------
// Base smart-contract proxy class
// provides constructor, view & call methods
// derive your specific contract proxy from this class
//-----------------------------
export class SmartContract {

    public signer: string = "";
    public signer_private_key: string = "";

    constructor(
        public contract_account: string,
    ) { }

    //non-payable, read-only, not signed call
    async view(method: string, args?: Uint8Array | Record<string, any>) {
        return near.view(this.contract_account, method, args || {});
    }

    //payable, alter-state call
    async call(method: string, args: Record<string, any>, TGas?: number, attachedYoctoNear?: string) {
        return near.call(this.contract_account, method, args, this.signer, this.signer_private_key, TGas || 200, attachedYoctoNear || "0");
    }

    //upgrade contract code
    async deployCode(code: Uint8Array) {
        return near.broadcast_tx_commit_actions(
            [deployContract(code)], this.signer, this.contract_account, this.signer_private_key);
    }
}

