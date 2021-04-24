import { SmartContract } from "./base-smart-contract";
export declare type FungibleTokenMetadata = {
    spec: string;
    name: string;
    symbol: string;
    icon: string | null;
    reference: string | null;
    reference_hash: string | null;
    decimals: number;
};
declare type U128String = string;
export declare class NEP141Trait extends SmartContract {
    ft_transfer(receiver_id: string, amount: U128String, memo?: string): Promise<void>;
    ft_transfer_call(receiver_id: string, amount: U128String, msg: string, memo?: string): Promise<void>;
    ft_total_supply(): Promise<U128String>;
    ft_balance_of(accountId: string): Promise<U128String>;
    ft_metadata(): Promise<FungibleTokenMetadata>;
    new(owner_id: string, owner_supply: U128String): Promise<void>;
}
export {};
