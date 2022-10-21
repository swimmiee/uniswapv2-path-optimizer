"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multicall_1 = __importDefault(require("./utils/multicall"));
const typechain_1 = require("./typechain");
const ethers_1 = require("ethers");
const Token_1 = require("./Token");
const Result_1 = require("./Result");
class UniswapV2PathOptimizer {
    constructor({ provider, factoryAddress, routerAddress, multicallAddress, feeBps }) {
        this._provider = provider;
        this._factory = typechain_1.Factory__factory.connect(factoryAddress, provider);
        this._router = typechain_1.Router__factory.connect(routerAddress, provider);
        this.initialize(0);
        this._ready = false;
        // optional
        this._multicallAddress = multicallAddress;
        this._defaultFeeBps = feeBps !== null && feeBps !== void 0 ? feeBps : 30;
    }
    checkIsReady() {
        if (!this._ready) {
            throw Error('execute "setTokens" method first.');
        }
    }
    tokens() {
        this.checkIsReady();
        return this._tokens;
    }
    getToken(id) {
        return this._tokens[id];
    }
    getTokenByAddress(address) {
        return this._tokens.find(t => t.address === address);
    }
    getTokenId(address) {
        return this._tokens.findIndex(t => t.address === ethers_1.utils.getAddress(address));
    }
    getPoolByTokenId(tokenAId, tokenBId) {
        this.checkIsReady();
        const N = this.tokens().length;
        if (tokenAId < 0 || tokenAId >= N) {
            throw Error(`First token not found`);
        }
        if (tokenBId < 0 || tokenBId >= N) {
            throw Error(`Second token not found`);
        }
        const poolId = this._poolOf[tokenAId][tokenBId];
        if (poolId === -1) {
            throw Error(`Pool not found`);
        }
        return this._pools[poolId];
    }
    getPoolByAddress(tokenA, tokenB) {
        const tokenAId = this.getTokenId(tokenA);
        const tokenBId = this.getTokenId(tokenB);
        return this.getPoolByTokenId(tokenAId, tokenBId);
    }
    multicall(calls) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, multicall_1.default)(calls, this._provider, this._multicallAddress);
        });
    }
    initialize(N) {
        this._tokens = [];
        this._pools = [];
        // fill with -1
        this._poolOf = new Array(N).fill(0).map(() => new Array(N).fill(-1));
    }
    init(tokens) {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize(tokens.length);
            let calls = [];
            const ERC20Interface = typechain_1.ERC20__factory.createInterface();
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
            const tokenInfoCutoff = calls.length; // cutoff = 2n
            for (let i = 0; i < tokens.length - 1; i++) {
                for (let j = i + 1; j < tokens.length; j++) {
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
            const info = yield this.multicall(calls);
            // set ERC20 tokens & Pools
            const tokenInfo = info.slice(0, tokenInfoCutoff);
            const pairAddresses = info.slice(tokenInfoCutoff); // length: n * (n-1) / 2
            let pairIndex = 0;
            for (let i = 0; i < tokens.length; i++) {
                const [symbol] = tokenInfo[i * 2];
                const [decimals] = tokenInfo[i * 2 + 1];
                this._tokens.push(new Token_1.Token(tokens[i], symbol, decimals));
                for (let j = i + 1; j < tokens.length; j++, pairIndex++) {
                    const [pool] = pairAddresses[pairIndex];
                    // pair not exists
                    if (pool === ethers_1.constants.AddressZero)
                        continue;
                    let [token0, token1] = tokens[i] < tokens[j] ? [i, j] : [j, i];
                    this._poolOf[token0][token1] = this._pools.length;
                    this._poolOf[token1][token0] = this._pools.length;
                    this._pools.push({
                        address: pool,
                        reserve0: ethers_1.BigNumber.from(0),
                        reserve1: ethers_1.BigNumber.from(0),
                        token0,
                        token1,
                        feeBps: this._defaultFeeBps
                    });
                }
            }
            yield this.refresh();
            this._ready = true;
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const PairInterface = typechain_1.Pair__factory.createInterface();
            const calls = this._pools.map(pool => ({
                interfaceObject: PairInterface,
                address: pool.address,
                method: "getReserves"
            }));
            const poolReserves = yield this.multicall(calls);
            poolReserves.map((r, i) => {
                this._pools[i].reserve0 = r._reserve0;
                this._pools[i].reserve1 = r._reserve1;
            });
        });
    }
    setFee(tokenA, tokenB, newFeeBps) {
        const pool = this.getPoolByAddress(tokenA, tokenB);
        pool.feeBps = newFeeBps;
    }
    getAdjacents(tokenId) {
        const adjacents = [];
        this._poolOf[tokenId].forEach((poolId, i) => {
            if (poolId >= 0) {
                adjacents.push(i);
            }
        });
        return adjacents;
    }
    bfs(from, to, maxLength) {
        const start = this.getTokenId(from);
        const finish = this.getTokenId(to);
        const queue = [[start]];
        const paths = [];
        while (queue.length > 0) {
            const history = queue.shift();
            const curr = history[history.length - 1];
            if (curr === finish) {
                paths.push(history);
                continue;
            }
            if (history.length >= maxLength) {
                continue;
            }
            const adjacents = this.getAdjacents(curr);
            adjacents.forEach(adjacent => {
                if (history.includes(adjacent))
                    return;
                queue.push(history.concat([adjacent]));
            });
        }
        return paths;
    }
    toAmountsOutResult(paths, amountsOuts) {
        return amountsOuts.map(({ amounts }, i) => (0, Result_1.amountsOutResult)(paths[i].map(tId => this._tokens[tId]), amounts)).sort((a, b) => Number(b.amountOut.sub(a.amountOut).gt(0)));
    }
    toAmountsInResult(paths, amountsIns) {
        return amountsIns
            .map(({ amounts }, i) => (0, Result_1.amountsInResult)(paths[i].map(tId => this._tokens[tId]), amounts))
            .sort((a, b) => Number(a.amountIn.sub(b.amountIn).gt(0)));
    }
    // onchain
    getOutPathsOnChain({ from, to, amountIn, maxLength }) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.bfs(from, to, maxLength);
            const calls = paths.map(path => ({
                interfaceObject: this._router.interface,
                address: this._router.address,
                method: "getAmountsOut",
                args: [
                    ethers_1.BigNumber.from(amountIn),
                    path.map(tokenId => this.getToken(tokenId).address),
                ]
            }));
            const amountsOuts = yield this.multicall(calls);
            return this.toAmountsOutResult(paths, amountsOuts);
        });
    }
    getOptimalOutPathOnChain(props) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getOutPathsOnChain(props))[0];
        });
    }
    getInPathsOnChain({ from, to, amountOut, maxLength }) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.bfs(from, to, maxLength);
            const calls = paths.map(path => ({
                interfaceObject: this._router.interface,
                address: this._router.address,
                method: "getAmountsIn",
                args: [
                    ethers_1.BigNumber.from(amountOut),
                    path.map(tokenId => this.getToken(tokenId).address),
                ]
            }));
            const amountsIns = yield this.multicall(calls);
            return this.toAmountsInResult(paths, amountsIns);
        });
    }
    getOptimalInPathOnChain(props) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getInPathsOnChain(props))[0];
        });
    }
    /**************
      * Off Chain
     **************/
    getReserves(tokenInId, tokenOutId) {
        const { feeBps, token0, reserve0, reserve1 } = this.getPoolByTokenId(tokenInId, tokenOutId);
        const [reserveIn, reserveOut] = token0 === tokenInId
            ? [reserve0, reserve1]
            : [reserve1, reserve0];
        return { feeBps, reserveIn, reserveOut };
    }
    getAmountOut(tokenAId, tokenBId, amountIn) {
        const { feeBps, reserveIn, reserveOut } = this.getReserves(tokenAId, tokenBId);
        const amountInWithFee = ethers_1.BigNumber.from(amountIn).mul(10000 - feeBps);
        const numerator = amountInWithFee.mul(reserveOut);
        const denominator = reserveIn.mul(10000).add(amountInWithFee);
        return numerator.div(denominator);
    }
    getAmountIn(tokenAId, tokenBId, amountOut) {
        const { feeBps, reserveIn, reserveOut } = this.getReserves(tokenAId, tokenBId);
        const numerator = reserveIn.mul(amountOut).mul(10000);
        const denominator = reserveOut.sub(amountOut).mul(10000 - feeBps);
        return numerator.div(denominator).add(1);
    }
    getAmountsOut(amountIn, path) {
        const amounts = new Array(path.length).fill(0).map(() => ethers_1.BigNumber.from(0));
        amounts[0] = ethers_1.BigNumber.from(amountIn);
        for (let i = 0; i < path.length - 1; i++)
            amounts[i + 1] = this.getAmountOut(path[i], path[i + 1], amounts[i]);
        return amounts;
    }
    getAmountsIn(amountOut, path) {
        const amounts = new Array(path.length).fill(0).map(() => ethers_1.BigNumber.from(0));
        amounts[amounts.length - 1] = ethers_1.BigNumber.from(amountOut);
        for (let i = path.length - 1; i > 0; i--)
            amounts[i - 1] = this.getAmountIn(path[i - 1], path[i], amounts[i]);
        return amounts;
    }
    getOutPathsOffChain({ from, to, amountIn, maxLength }) {
        const paths = this.bfs(from, to, maxLength);
        const amountsOuts = paths.map(path => ({ amounts: this.getAmountsOut(amountIn, path) }));
        return this.toAmountsOutResult(paths, amountsOuts);
    }
    getOptimalOutPathOffChain(props) {
        return this.getOutPathsOffChain(props)[0];
    }
    getInPathsOffChain({ from, to, amountOut, maxLength }) {
        const paths = this.bfs(from, to, maxLength);
        const amountsIns = paths.map(path => ({ amounts: this.getAmountsIn(amountOut, path) }));
        return this.toAmountsInResult(paths, amountsIns);
    }
    getOptimalInPathOffChain(props) {
        return this.getInPathsOffChain(props)[0];
    }
}
exports.default = UniswapV2PathOptimizer;
