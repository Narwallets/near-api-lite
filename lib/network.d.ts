export declare type NetworkInfo = {
    name: string;
    rootAccount: string;
    displayName: string;
    color: string;
    rpc: string;
    explorerUrl: string;
    NearWebWalletUrl: string;
};
export declare const NetworkList: NetworkInfo[];
export declare const defaultName = "mainnet";
export declare let current: string;
export declare function setCurrent(networkName: string): void;
export declare function getInfo(name: string): NetworkInfo;
export declare function currentInfo(): NetworkInfo;
