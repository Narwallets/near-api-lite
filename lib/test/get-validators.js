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
exports.getValidators = exports.yton = exports.ntoy = void 0;
// near-api-js
const near = __importStar(require("near-api-js"));
// NW-near-api-lite
const lite = __importStar(require("../index.js"));
//import * as KP from "./keypair.js"
//nearAPI.utils.key_pair = undefined;
//this is required if using a local .env file for private key
//require('dotenv').config();
const util = require('util');
/**
 * convert nears expressed as a js-number with MAX 6 decimals into a yoctos-string
 * @param n amount in near MAX 4 DECIMALS
 */
function ntoy(n) {
    let millionsText = Math.round(n * 1e4).toString(); // near * 1e4 - round
    let yoctosText = millionsText + "0".repeat(20); //  mul by 1e20 => yoctos = near * 1e(4+20)
    return yoctosText;
}
exports.ntoy = ntoy;
/**
 * returns amount truncated to 4 decimal places
 * @param yoctos amount expressed in yoctos
 */
function yton(yoctos) {
    if (yoctos.indexOf(".") !== -1)
        throw new Error("a yocto string can't have a decimal point: " + yoctos);
    let padded = yoctos.padStart(25, "0"); //at least 0.xxx
    let nearsText = padded.slice(0, -24) + "." + padded.slice(-24, -20); //add decimal point. Equivalent to near=yoctos/1e24 and truncate to 4 dec places
    return Number(nearsText);
}
exports.yton = yton;
// configure accounts, network, and amount of NEAR to send
const sender = 'lucio.testnet';
const receiver = 'luciotato2.testnet';
const amountY = ntoy(0.25);
// creates keyPair used to sign transaction
const privateKey = "5dXosrrX9edUVWCuRZ2gmYqrFhrssqjmE5RWTVszEPceTdaX9pfHJMJNnbSTRFt3E5qd2NX1fmFZAW4N1TZxRoet";
const keyPair = near.utils.KeyPairEd25519.fromString(privateKey);
async function getValidators() {
    let network = lite.currentInfo();
    const provider = new near.providers.JsonRpcProvider(network.rpc);
    let validators = await provider.validators(null);
    //console.log(util.inspect(validators))
    console.log("NEAR", validators.current_validators.length);
    let validators2 = await lite.getValidators();
    //console.log(util.inspect(validators))
    console.log("LITE", validators2.current_validators.length);
}
exports.getValidators = getValidators;
;
