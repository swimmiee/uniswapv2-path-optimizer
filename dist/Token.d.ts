import { BigNumber, BigNumberish } from "ethers";
import { address } from "./types";
export declare class Token {
    address: string;
    symbol: string;
    decimals: number;
    constructor(_address: address, _symbol: string, _decimals: number);
    format(amount: BigNumber): string;
    parse(amount: string | number): BigNumber;
}
export declare class TokenWithAmount extends Token {
    private amount;
    constructor(token: Token, _amount: BigNumberish);
    format(): string;
    bn(): BigNumber;
}
