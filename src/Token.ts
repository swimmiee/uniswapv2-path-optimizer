import { utils, BigNumber, BigNumberish  } from "ethers";
import { address } from "./types";

export class Token {
    address: string
    symbol: string
    decimals: number
    constructor(_address: address, _symbol: string, _decimals: number){
        this.address = utils.getAddress(_address);
        this.symbol = _symbol;
        this.decimals = _decimals;
    }
    
    format(amount: BigNumber){
        return utils.formatUnits(amount, this.decimals);
    }
    parse(amount: string | number){
        return utils.parseUnits(String(amount), this.decimals);
    }
}

export class TokenWithAmount extends Token {
    private amount!: BigNumber;
    constructor(token:Token, _amount: BigNumberish){
        super(token.address, token.symbol, token.decimals);
        this.amount = BigNumber.from(_amount);
    }
    format(){
        return utils.formatUnits(this.amount, this.decimals);
    }
    bn(){
        return this.amount;
    }
}