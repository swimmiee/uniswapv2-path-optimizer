import { BigNumber, BigNumberish } from "ethers";
import { address, AmountsInResult, AmountsOutResult, GetInPathParams, GetOutPathParams, Pool, UniswapV2PathOptimizerProps } from "./types";
import { Token } from "./Token";
declare class UniswapV2PathOptimizer {
    private _provider;
    private _factory;
    private _router;
    private _tokens;
    private _pools;
    private _poolOf;
    private _ready;
    private _defaultFeeBps;
    private _multicallAddress?;
    constructor({ provider, factoryAddress, routerAddress, multicallAddress, feeBps }: UniswapV2PathOptimizerProps);
    private checkIsReady;
    tokens(): Token[];
    getToken(id: number): Token;
    getTokenByAddress(address: address): Token | undefined;
    getTokenId(address: address): number;
    getPoolByTokenId(tokenAId: number, tokenBId: number): Pool;
    getPoolByAddress(tokenA: address, tokenB: address): Pool;
    private multicall;
    private initialize;
    init(tokens: address[]): Promise<void>;
    refresh(): Promise<void>;
    setFee(tokenA: address, tokenB: address, newFeeBps: number): void;
    private getAdjacents;
    bfs(from: address, to: address, maxLength: number): number[][];
    private toAmountsOutResult;
    private toAmountsInResult;
    getOutPathsOnChain({ from, to, amountIn, maxLength }: GetOutPathParams): Promise<AmountsOutResult[]>;
    getOptimalOutPathOnChain(props: GetOutPathParams): Promise<AmountsOutResult>;
    getInPathsOnChain({ from, to, amountOut, maxLength }: GetInPathParams): Promise<AmountsInResult[]>;
    getOptimalInPathOnChain(props: GetInPathParams): Promise<AmountsInResult>;
    /**************
      * Off Chain
     **************/
    private getReserves;
    getAmountOut(tokenAId: number, tokenBId: number, amountIn: BigNumberish): BigNumber;
    getAmountIn(tokenAId: number, tokenBId: number, amountOut: BigNumberish): BigNumber;
    getAmountsOut(amountIn: BigNumberish, path: number[]): BigNumber[];
    getAmountsIn(amountOut: BigNumberish, path: number[]): BigNumber[];
    getOutPathsOffChain({ from, to, amountIn, maxLength }: GetOutPathParams): AmountsOutResult[];
    getOptimalOutPathOffChain(props: GetOutPathParams): AmountsOutResult;
    getInPathsOffChain({ from, to, amountOut, maxLength }: GetInPathParams): AmountsInResult[];
    getOptimalInPathOffChain(props: GetInPathParams): AmountsInResult;
}
export default UniswapV2PathOptimizer;
