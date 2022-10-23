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
    public amount!: BigNumber;
    public amountWithoutPriceImpact!: BigNumber;

    constructor(token:Token, _amount: BigNumberish){
        super(token.address, token.symbol, token.decimals);
        this.amount = BigNumber.from(_amount);
        // first initiate amount, and calculate right before returned from off chain
        this.amountWithoutPriceImpact = this.amount;
    }
    format(){
        return utils.formatUnits(this.amount, this.decimals);
    }
    formatWithoutPriceImpact(){
        return utils.formatUnits(this.amountWithoutPriceImpact, this.decimals);
    }
    
    public setAmountWithoutPriceImpact(value : BigNumber) {
        this.amountWithoutPriceImpact = value;
    }
}