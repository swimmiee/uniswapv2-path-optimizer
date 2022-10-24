import multicall from "./utils/multicall";
import { Provider } from "@ethersproject/providers";
import { Factory, Factory__factory, Router__factory, Router, ERC20__factory, Pair__factory } from "./typechain";
import { BigNumber, BigNumberish, constants, utils } from "ethers";
import { address, AmountsCallResult, GetInPathParams, GetOptimalInPathParams, GetOptimalOutPathParams, GetOutPathParams, MulticallCallDataInput, Pool, PoolReserves, Reserve, UniswapV2PathOptimizerProps } from "./types";
import { Token } from "./Token";
import { AmountsInResult, AmountsOutResult } from "./Result";

class UniswapV2PathOptimizer {
    private _provider!: Provider
    private _factory!: Factory;
    private _router!: Router;
    private _tokens!: Token[];
    private _pools!: Pool[];
    private _poolOf!: number[][];
    private _ready: boolean;
    private _defaultFeeBps!: number; 
    private _multicallAddress?: string;
    
    constructor({
        provider,
        factoryAddress,
        routerAddress,
        multicallAddress,
        feeBps
    }: UniswapV2PathOptimizerProps){
        this._provider = provider;
        this._factory = Factory__factory.connect(factoryAddress, provider);
        this._router = Router__factory.connect(routerAddress, provider);

        this.initialize(0);
        this._ready = false;

        // optional
        this._multicallAddress = multicallAddress;
        this._defaultFeeBps = feeBps ?? 30;
    }

    private checkIsReady(){
        if(!this._ready){
            throw Error('execute "setTokens" method first.');
        }
    }
    public tokens(){
        this.checkIsReady();
        return this._tokens;
    }
    public getToken(id: number){
        return this._tokens[id];
    }
    public getTokenByAddress(address: address){
        return this._tokens.find(t => t.address === address);
    }
    public getTokenId(address: address){
        return this._tokens.findIndex(t => t.address === utils.getAddress(address));
    }

    public getPoolByTokenId(tokenAId: number, tokenBId: number){
        this.checkIsReady();
        const N = this.tokens().length;
        if(tokenAId < 0 || tokenAId >= N){
            throw Error(`First token not found`)
        }
        if(tokenBId < 0 || tokenBId >= N){
            throw Error(`Second token not found`)
        }
        const poolId = this._poolOf[tokenAId][tokenBId];
        if(poolId === -1){
            throw Error(`Pool not found`)
        }
        return this._pools[poolId];
    }

    public getPoolByAddress(tokenA: address, tokenB: address){
        const tokenAId = this.getTokenId(tokenA)!;
        const tokenBId = this.getTokenId(tokenB)!;
        return this.getPoolByTokenId(tokenAId, tokenBId);
    }

    private async multicall<T>(calls: MulticallCallDataInput[]){
        return multicall<T>(calls, this._provider, this._multicallAddress);
    }
    
    private initialize(N: number){
        this._tokens = [];
        this._pools = [];

        // fill with -1
        this._poolOf = new Array(N).fill(0).map(() => new Array(N).fill(-1));
    }

    public async init(tokens: address[]){
        this.initialize(tokens.length);

        let calls:MulticallCallDataInput[] = [];
        const ERC20Interface = ERC20__factory.createInterface();
        const FactoryInterface = this._factory.interface;
        tokens.forEach(token => {
            calls.push({
                interfaceObject: ERC20Interface,
                address: token,
                method: "symbol",
            });
            calls.push({
                interfaceObject: ERC20Interface,
                address: token,
                method: "decimals",
            });
        });
        const tokenInfoCutoff = calls.length;   // cutoff = 2n

        for(let i = 0; i < tokens.length - 1; i++){
            for(let j = i + 1; j < tokens.length; j++){
                calls.push({
                    interfaceObject: FactoryInterface,
                    address: this._factory.address,
                    method: "getPair",
                    args: [
                        tokens[i],
                        tokens[j],
                    ]
                });
            }
        }
        // calls length = 2n + n * (n-1) / 2

        // multicall
        const info = await this.multicall<any>(calls);

        // set ERC20 tokens & Pools
        const tokenInfo = info.slice(0, tokenInfoCutoff);
        const pairAddresses:string[] = info.slice(tokenInfoCutoff); // length: n * (n-1) / 2

        let pairIndex = 0;
        for(let i = 0; i < tokens.length; i++){
            const [symbol] = tokenInfo[i * 2];
            const [decimals] = tokenInfo[i * 2 + 1];
            this._tokens.push(
                new Token(tokens[i], symbol, decimals)
            );

            for(let j = i + 1; j < tokens.length; j++, pairIndex++){
                const [pool] = pairAddresses[pairIndex];
                // pair not exists
                if(pool === constants.AddressZero) continue;
                let [token0, token1] = tokens[i] < tokens[j] ? [i, j] : [j, i];

                this._poolOf[token0][token1] = this._pools.length;
                this._poolOf[token1][token0] = this._pools.length;
                this._pools.push({
                    address: pool,
                    reserve0: BigNumber.from(0),
                    reserve1: BigNumber.from(0),
                    token0,
                    token1,
                    feeBps: this._defaultFeeBps
                });
            }
        }

        await this.refresh();
        this._ready = true;
    }

    public async refresh(){
        const PairInterface = Pair__factory.createInterface();

        const calls:MulticallCallDataInput[] = this._pools.map(pool => ({
            interfaceObject: PairInterface,
            address: pool.address,
            method: "getReserves"
        }))
        const poolReserves = await this.multicall<Reserve>(calls);
        poolReserves.map((r, i) => {
            this._pools[i].reserve0 = r._reserve0;
            this._pools[i].reserve1 = r._reserve1;
        })
    }

    public setFee(tokenA: address, tokenB: address, newFeeBps: number){
        const pool = this.getPoolByAddress(tokenA, tokenB);
        pool.feeBps = newFeeBps;
    }

    private getAdjacents(tokenId: number){
        const adjacents:number[] = [];
        this._poolOf[tokenId].forEach((poolId, i) => {
            if(poolId >= 0){
                adjacents.push(i);
            }
        })
        return adjacents;
    }

    public bfs(from: address, to: address, maxLength: number): number[][]{
        const start = this.getTokenId(from);
        const finish = this.getTokenId(to);

        const queue: number[][] = [ [start] ];
        const paths: number[][] = [];
        while(queue.length > 0){
            const history = queue.shift()!;
            const curr = history[history.length-1];
            if(curr === finish){
                paths.push(history)
                continue;
            }
            if(history.length >= maxLength){
                continue;
            }
            const adjacents = this.getAdjacents(curr);
            adjacents.forEach(adjacent => {
                if(history.includes(adjacent)) return;
                queue.push(history.concat([adjacent]));
            })
        }

        return paths;
    }

    private toAmountsOutResult(
        paths: number[][],
        amountsOuts: BigNumber[][], 
        take?: number
    ): AmountsOutResult[]{
        return amountsOuts.map((amounts, index) => ({
            index,
            result: new AmountsOutResult(
                paths[index].map(tId => this._tokens[tId]),
                amounts
            )
        }))
        .sort((a, b) => Number(b.result.amountOut.sub(a.result.amountOut).gt(0)))
        .slice(0, take)
        .map(({index, result}) => {
            // get withoutPriceImpact at last step
            const amountsWithoutPriceImpact = this.getAmountsOut(
                result.amountIn,
                paths[index],
                false
            );
            AmountsOutResult.setPriceImpact(result, amountsWithoutPriceImpact);
            return result
        });
    }
    private toAmountsInResult(
        paths: number[][],
        amountsIns: BigNumber[][], 
        take?: number
    ): AmountsInResult[]{
        return amountsIns.map((amounts, index) => ({
            index,
            result: new AmountsInResult(
                paths[index].map(tId => this._tokens[tId]),
                amounts
            )
        }))
        .sort((a, b) => Number(a.result.amountIn.sub(b.result.amountIn).gt(0)))
        .slice(0, take)
        .map(({index, result}) => {
            // get withoutPriceImpact at last step
            const amountsWithoutPriceImpact = this.getAmountsIn(
                result.amountOut,
                paths[index],
                false
            );
            AmountsOutResult.setPriceImpact(result, amountsWithoutPriceImpact);
            return result
        });
    }

    // onchain
    public async getOutPathsOnChain({
        from,
        to,
        amountIn,
        maxLength,
        take
    }:GetOutPathParams):Promise<AmountsOutResult[]>{
        const paths = this.bfs(from, to, maxLength);
        const calls:MulticallCallDataInput[] = paths.map(
            path => ({
                interfaceObject: this._router.interface,
                address: this._router.address,
                method: "getAmountsOut",
                args: [
                    BigNumber.from(amountIn),
                    path.map(tokenId => this.getToken(tokenId).address),
                ]
            })
        );
        const amountsOuts = await this.multicall<AmountsCallResult>(calls);
        return this.toAmountsOutResult(paths, amountsOuts.map(outs => outs.amounts), take);
    }

    public async getOptimalOutPathOnChain(props: GetOutPathParams):Promise<AmountsOutResult>{
        return (await this.getOutPathsOnChain(props))[0];
    }

    public async getInPathsOnChain({
        from,
        to,
        amountOut,
        maxLength,
        take
    }: GetInPathParams):Promise<AmountsInResult[]>{
        const paths = this.bfs(from, to, maxLength);
        const calls:MulticallCallDataInput[] = paths.map(
            path => ({
                interfaceObject: this._router.interface,
                address: this._router.address,
                method: "getAmountsIn",
                args: [
                    BigNumber.from(amountOut),
                    path.map(tokenId => this.getToken(tokenId).address),
                ]
            })
        );
        const amountsIns = await this.multicall<AmountsCallResult>(calls);
        return this.toAmountsInResult(paths, amountsIns.map(ins => ins.amounts), take);
    }

    public async getOptimalInPathOnChain(props: GetOptimalInPathParams):Promise<AmountsInResult>{
        return (await this.getInPathsOnChain({...props, take: 1}))[0];
    }

    /**************
      * Off Chain
      * Without Price Impact should be calculated in off chain
     **************/
    private getReserves(tokenInId: number, tokenOutId: number):PoolReserves{
        const {feeBps, token0, reserve0, reserve1} = this.getPoolByTokenId(tokenInId, tokenOutId);
        const [reserveIn, reserveOut] = token0 === tokenInId
            ? [reserve0, reserve1]
            : [reserve1, reserve0];
        return { feeBps, reserveIn, reserveOut };
    }

    public getAmountOut(tokenAId: number, tokenBId: number, amountIn: BigNumberish, priceImpact:boolean = true){
        const {feeBps, reserveIn, reserveOut} = this.getReserves(tokenAId, tokenBId);
        const amountInWithFee = BigNumber.from(amountIn).mul(10000 - feeBps);
        const numerator = amountInWithFee.mul(reserveOut);
        const denominator = priceImpact
            ? reserveIn.mul(10000).add(amountInWithFee)
            : reserveIn.mul(10000);
        return numerator.div(denominator);
    }

    public getAmountIn(tokenAId: number, tokenBId: number, amountOut: BigNumberish, priceImpact:boolean = true){
        const {feeBps, reserveIn, reserveOut} = this.getReserves(tokenAId, tokenBId);
        const numerator = reserveIn.mul(amountOut).mul(10000);
        const denominator = priceImpact
            ? reserveOut.sub(amountOut).mul(10000 - feeBps)
            : reserveOut.mul(10000 - feeBps);
        return numerator.div(denominator).add(1);
    }

    public getAmountsOut(amountIn: BigNumberish, path: number[], priceImpact:boolean = true): BigNumber[]{
        const amounts = new Array(path.length).fill(0).map(() => BigNumber.from(0)); 
        amounts[0] = BigNumber.from(amountIn);
        for (let i = 0; i < path.length - 1; i++)
            amounts[i + 1] = this.getAmountOut(path[i], path[i + 1], amounts[i], priceImpact);
        return amounts;
    }

    public getAmountsIn(amountOut: BigNumberish, path: number[], priceImpact:boolean = true): BigNumber[]{
        const amounts = new Array(path.length).fill(0).map(() => BigNumber.from(0)); 
        amounts[amounts.length - 1] = BigNumber.from(amountOut);
        for (let i = path.length - 1; i > 0; i--)
            amounts[i - 1] = this.getAmountIn(path[i - 1], path[i], amounts[i], priceImpact);
        return amounts;
    }

    public getOutPathsOffChain({from, to, amountIn, maxLength, take}:GetOutPathParams):AmountsOutResult[]{
        const paths = this.bfs(from, to, maxLength);
        const amountsOuts:BigNumber[][] = paths.map(path => this.getAmountsOut(amountIn, path));
        return this.toAmountsOutResult(paths, amountsOuts, take);
    }

    public getOptimalOutPathOffChain(props: GetOptimalOutPathParams):AmountsOutResult{
        return this.getOutPathsOffChain({...props, take: 1})[0];
    }

    public getInPathsOffChain({from, to, amountOut, maxLength, take}: GetInPathParams):AmountsInResult[]{
        const paths = this.bfs(from, to, maxLength);
        const amountsIns:BigNumber[][] = paths.map(path => this.getAmountsIn(amountOut, path));
        return this.toAmountsInResult(paths, amountsIns, take);
    }

    public getOptimalInPathOffChain(props: GetOptimalInPathParams):AmountsInResult{
        return this.getInPathsOffChain({...props, take: 1})[0];
    }
}


export default UniswapV2PathOptimizer;