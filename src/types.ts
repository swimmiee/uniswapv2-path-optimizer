import { BigNumber, BigNumberish, utils } from "ethers";
import { Provider } from "@ethersproject/providers";

export type address = string;

export interface UniswapV2PathOptimizerProps {
    provider: Provider,
    factoryAddress: address,
    routerAddress: address,
    multicallAddress?: string,
    feeBps?: number
    customFee?: boolean
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

export interface AmountsCallResult {
    amounts: BigNumber[]
}

interface GetPathParamsBase {
    from: address
    to: address
    maxLength: number
}

export interface GetOptimalInPathParams extends GetPathParamsBase {
    amountOut: BigNumberish
};
export interface GetOptimalOutPathParams extends GetPathParamsBase {
    amountIn: BigNumberish
};
export interface GetInPathParams extends GetOptimalInPathParams {
    take?: number
};
export interface GetOutPathParams extends GetOptimalOutPathParams {
    take?: number
};