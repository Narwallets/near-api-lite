"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentInfo = exports.getInfo = exports.setCurrent = exports.current = exports.defaultName = exports.NetworkList = void 0;
const json_rpc_js_1 = require("./utils/json-rpc.js");
exports.NetworkList = [
    { name: "mainnet", rootAccount: "near", displayName: "NEAR Mainnet", color: "green",
        rpc: "https://rpc.mainnet.near.org/", explorerUrl: "https://explorer.near.org/", NearWebWalletUrl: "https://wallet.near.org/",
    },
    { name: "guildnet", rootAccount: "guildnet", displayName: "OSA Guildnet", color: "cyan",
        rpc: "https://rpc.openshards.io/", explorerUrl: "https://explorer.guildnet.near.org/", NearWebWalletUrl: "https://wallet.openshards.io/",
    },
    { name: "testnet", rootAccount: "testnet", displayName: "NEAR Testnet", color: "yellow",
        rpc: "https://rpc.testnet.near.org/", explorerUrl: "https://explorer.testnet.near.org/", NearWebWalletUrl: "https://wallet.testnet.near.org/",
    },
    { name: "betanet", rootAccount: "betanet", displayName: "NEAR Betanet", color: "violet",
        rpc: "https://rpc.betanet.near.org/", explorerUrl: "https://explorer.betanet.near.org/", NearWebWalletUrl: "https://wallet.betanet.near.org/",
    },
    { name: "local", rootAccount: "local", displayName: "Local Network", color: "red",
        rpc: "http://127.0.0.1/rpc", explorerUrl: "http://127.0..0.1/explorer/", NearWebWalletUrl: "http://127.0..0.1/wallet/",
    },
];
exports.defaultName = "mainnet"; //default network
exports.current = exports.defaultName;
function setCurrent(networkName) {
    const info = getInfo(networkName); //get & check
    if (networkName == exports.current) { //no change
        return;
    }
    exports.current = networkName;
    (0, json_rpc_js_1.setRpcUrl)(info.rpc);
}
exports.setCurrent = setCurrent;
;
function getInfo(name) {
    for (let i = 0; i < exports.NetworkList.length; i++)
        if (exports.NetworkList[i].name === name)
            return exports.NetworkList[i];
    throw new Error("invalid network name: " + name);
}
exports.getInfo = getInfo;
function currentInfo() { return getInfo(exports.current); }
exports.currentInfo = currentInfo;
;
