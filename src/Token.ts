import { utils, BigNumber, BigNumberish  } from "ethers";
import { address } from "./types";

export class Token {
    public readonly address!: string
    public readonly symbol!: string
    public readonly decimals!: number
    constructor(_address: address, _symbol: string, _decimals: number){
        this.address = utils.getAddress(_address);
        this.symbol = _symbol;
        this.decimals = _decimals;
    }
    
    public parse(amount: string | number){
        return utils.parseUnits(String(amount), this.decimals);
    }
}

export class TokenWithAmount extends Token {
    public readonly amount!: BigNumber;
    public amountWithoutPriceImpact!: BigNumber;

    constructor(token:Token, _amount: BigNumberish){
        super(token.address, token.symbol, token.decimals);
        this.amount = BigNumber.from(_amount);
        // first initiate amount, and calculate right before returned from off chain
        this.amountWithoutPriceImpact = this.amount;
    }

    static setAmountWithoutPriceImpact(tokenWithAmount: TokenWithAmount, value : BigNumber) {
        tokenWithAmount.amountWithoutPriceImpact = value;
        // set amountWithoutPriceImpact read-only
        Object.freeze(this);
    }

    private _floor(value: string, places: number){
        const [integer, digits] = value.split(".");
        return digits === undefined ? integer : `${integer}.${digits.slice(0, places)}`;
    }
    public format(places?: number): string{
        const formatted = utils.formatUnits(this.amount, this.decimals);
        return places ? this._floor(formatted, places) : formatted;
    }
    public formatWithoutPriceImpact(places?: number): string{
        const formatted = utils.formatUnits(this.amountWithoutPriceImpact, this.decimals);
        return places ? this._floor(formatted, places) : formatted;
    }
}