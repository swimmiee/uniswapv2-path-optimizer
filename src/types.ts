import { BigNumber, BigNumberish, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import { TokenWithAmount } from "./Token";

export type address = string;

export interface UniswapV2PathOptimizerProps {
    provider: Provider,
    factoryAddress: address,
    routerAddress: address,
    multicallAddress?: string,
    feeBps?: number
}

export interface Pool {
    address: address;
    token0: number;  // index of token array
    token1: number;  // index of token array
    reserve0: BigNumber;
    reserve1: BigNumber;
    feeBps: number
}

export interface PoolReserves {
    feeBps: number;
    reserveIn: BigNumber;
    reserveOut: BigNumber;
}

export interface MulticallCallDataInput {
    interfaceObject: utils.Interface
    address: string
    method: string
    args?: any[]
}

export interface Reserve {
    _reserve0: BigNumber;
    _reserve1: BigNumber;
    _blockTimestampLast: number; 
}

export interface Amounts {
    amounts: BigNumber[]
}

export interface GetInPathParams {
    from: address,
    to: address,
    amountOut: BigNumberish,
    maxLength: number
};
export interface GetOutPathParams {
    from: address,
    to: address,
    amountIn: BigNumberish,
    maxLength: number
};

type PriceImpact = {priceImpactBps: number}
export type PathResult =  TokenWithAmount[] & {formatted: string[]};
export type AmountsOutResult = PathResult & {amountOut: BigNumber} & PriceImpact;
export type AmountsInResult = PathResult & {amountIn: BigNumber} & PriceImpact;