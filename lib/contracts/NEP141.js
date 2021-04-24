"use strict";
//JSON compatible struct ft_metadata
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEP141Trait = void 0;
const base_smart_contract_1 = require("./base-smart-contract");
class NEP141Trait extends base_smart_contract_1.SmartContract {
    async ft_transfer(receiver_id, amount, memo) {
        return this.call("ft_transfer", { receiver_id: receiver_id, amount: amount, memo: memo }, 200, "1"); //one-yocto attached
    }
    async ft_transfer_call(receiver_id, amount, msg, memo) {
        return this.call("ft_transfer_call", { receiver_id: receiver_id, amount: amount, memo: memo, msg: msg }, 200, "1"); //one-yocto attached
    }
    async ft_total_supply() {
        return this.view("ft_total_supply");
    }
    async ft_balance_of(accountId) {
        return this.view("ft_balance_of", { account_id: accountId });
    }
    async ft_metadata() {
        return this.view("ft_metadata");
    }
    async new(owner_id, owner_supply) {
        return this.call("new", { owner_id: owner_id, owner_supply: owner_supply });
    }
}
exports.NEP141Trait = NEP141Trait;
