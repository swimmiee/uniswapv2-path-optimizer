"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenWithAmount = exports.Token = void 0;
const ethers_1 = require("ethers");
class Token {
    constructor(_address, _symbol, _decimals) {
        this.address = ethers_1.utils.getAddress(_address);
        this.symbol = _symbol;
        this.decimals = _decimals;
    }
    format(amount) {
        return ethers_1.utils.formatUnits(amount, this.decimals);
    }
    parse(amount) {
        return ethers_1.utils.parseUnits(String(amount), this.decimals);
    }
}
exports.Token = Token;
class TokenWithAmount extends Token {
    constructor(token, _amount) {
        super(token.address, token.symbol, token.decimals);
        this.amount = ethers_1.BigNumber.from(_amount);
    }
    format() {
        return ethers_1.utils.formatUnits(this.amount, this.decimals);
    }
    bn() {
        return this.amount;
    }
}
exports.TokenWithAmount = TokenWithAmount;
