import { BigNumber } from "ethers";
import { Token, TokenWithAmount } from "./Token";
import { AmountsInResult, AmountsOutResult, PathResult } from "./types";

function result(_path: Token[], _amounts: BigNumber[]):PathResult{
    const path = _path.map((token, i) => new TokenWithAmount(token, _amounts[i]));
    return Object.assign(path, {formatted: path.map(token => token.format())});
}

export function amountsOutResult(_path: Token[], _amounts: BigNumber[]):AmountsOutResult{
    return Object.assign(
        result(_path, _amounts),
        {amountOut: _amounts[_amounts.length - 1], priceImpactBps: 10000}   // temp
    )
}
export function amountsInResult(_path: Token[], _amounts: BigNumber[]):AmountsInResult{
    return Object.assign(
        result(_path, _amounts),
        {amountIn: _amounts[0], priceImpactBps: 10000}     // temp
    )
}