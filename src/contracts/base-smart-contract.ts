import * as near from '../near-rpc.js';

//-----------------------------
// Base smart-contract proxy class
// provides constructor, view & call methods
// derive your specific contract proxy from this class
//-----------------------------
export class SmartContract {
    
    constructor(
        public contract_account: string,
        public signer: string,
        public signer_private_key: string,
    ){}
    async view(method:string, args?:Record<string,any>){
        return near.view(this.contract_account,method,args||{});
    }
    async call(method:string, args:Record<string,any>,TGas?:number,attachedYoctoNear?:string){
        return near.call(this.contract_account,method,args,this.signer,this.signer_private_key,TGas||200,attachedYoctoNear||"0");
    }

}

