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
exports.SmartContract = void 0;
const near = __importStar(require("../near-rpc.js"));
//-----------------------------
// Base smart-contract proxy class
// provides constructor, view & call methods
// derive your specific contract proxy from this class
//-----------------------------
class SmartContract {
    constructor(contract_account, signer, signer_private_key) {
        this.contract_account = contract_account;
        this.signer = signer;
        this.signer_private_key = signer_private_key;
    }
    async view(method, args) {
        return near.view(this.contract_account, method, args || {});
    }
    async call(method, args, TGas, attachedYoctoNear) {
        return near.call(this.contract_account, method, args, this.signer, this.signer_private_key, TGas || 200, attachedYoctoNear || "0");
    }
}
exports.SmartContract = SmartContract;
