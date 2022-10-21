import { BigNumber } from "ethers";
import { Token } from "./Token";
import { AmountsInResult, AmountsOutResult } from "./types";
export declare function amountsOutResult(_path: Token[], _amounts: BigNumber[]): AmountsOutResult;
export declare function amountsInResult(_path: Token[], _amounts: BigNumber[]): AmountsInResult;
