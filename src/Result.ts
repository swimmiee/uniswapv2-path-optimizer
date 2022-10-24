import { BigNumber } from "ethers";
import { Token, TokenWithAmount } from "./Token";

export abstract class PathResult {
    public readonly path!: TokenWithAmount[]
    public readonly amountIn!: BigNumber
    public readonly amountOut!: BigNumber

    constructor(path: Token[], amounts: BigNumber[]){
        this.path = path.map(
            (token, i) => new TokenWithAmount(token, amounts[i])
        );
        this.amountIn = amounts[0];
        this.amountOut = amounts[amounts.length - 1];
    }

    static setPriceImpact(result: PathResult, amountsWithoutPriceImpact: BigNumber[]){
        result.path.forEach((path, i) => {
            TokenWithAmount.setAmountWithoutPriceImpact(path, amountsWithoutPriceImpact[i]);
        });
    }

    public format():String[]{
        return this.path.map(token => token.format())
    }
    public formatWithoutPriceImpact():String[]{
        return this.path.map(token => token.formatWithoutPriceImpact())
    }
    public priceImpactBps():number{
        throw new Error('priceImpactBps() must be implement.');
    }
    public amountInWithToken(): TokenWithAmount {
        return this.path[0]
    }
    public amountOutWithToken(): TokenWithAmount {
        return this.path[this.path.length - 1]
    }
}

export class AmountsOutResult extends PathResult {
    public priceImpactBps(): number {
        const amountOut = this.amountOutWithToken();
        return amountOut.amountWithoutPriceImpact
            .sub(amountOut.amount)
            .mul(1E4)
            .div(amountOut.amountWithoutPriceImpact)
            .toNumber()
    }
}
export class AmountsInResult extends PathResult {
    public priceImpactBps(): number {
        const amountIn = this.amountInWithToken();
        return amountIn.amount
            .sub(amountIn.amountWithoutPriceImpact)
            .mul(1E4)
            .div(amountIn.amount)
            .toNumber()
    }
}