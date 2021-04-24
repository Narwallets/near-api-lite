export declare class SmartContract {
    contract_account: string;
    signer: string;
    signer_private_key: string;
    constructor(contract_account: string, signer: string, signer_private_key: string);
    view(method: string, args?: Record<string, any>): Promise<any>;
    call(method: string, args: Record<string, any>, TGas?: number, attachedYoctoNear?: string): Promise<any>;
}
