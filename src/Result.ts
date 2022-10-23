import { BigNumber } from "ethers";
import { Token, TokenWithAmount } from "./Token";

export abstract class PathResult {
    private _path!: TokenWithAmount[]
    constructor(path: Token[], amounts: BigNumber[]){
        this._path = path.map(
            (token, i) => new TokenWithAmount(token, amounts[i])
        );
    }
    static setPriceImpact(result: PathResult, amountsWithoutPriceImpact: BigNumber[]){
        result._path.forEach((path, i) => {
            path.setAmountWithoutPriceImpact(amountsWithoutPriceImpact[i]);
        })
    }
    public path(){
        return this._path;
    }
    public pathLength(){
        return this._path.length;
    }
    public format(){
        return this.path().map(token => token.format())
    }
    public priceImpactBps(){
        throw new Error('priceImpactBps() must be implement.');
    }
    public amountInWithToken(): TokenWithAmount{
        return this.path()[0]
    }
    public amountOutWithToken(): TokenWithAmount{
        const _path = this.path();
        return _path[_path.length - 1]
    }
    public amountIn(){
        return this.amountInWithToken().amount
    }
    public amountOut(): BigNumber{
        return this.amountOutWithToken().amount
    }
}

export class AmountsOutResult extends PathResult {
    public priceImpactBps(): number{
        const amountOut = this.amountOutWithToken();
        return amountOut.amountWithoutPriceImpact
            .sub(amountOut.amount)
            .mul(1E4)
            .div(amountOut.amountWithoutPriceImpact)
            .toNumber()
    }
}
export class AmountsInResult extends PathResult {
    public priceImpactBps(): number{
        const amountIn = this.amountInWithToken();
        return amountIn.amount
            .sub(amountIn.amountWithoutPriceImpact)
            .mul(1E4)
            .div(amountIn.amount)
            .toNumber()
    }
}