import { providers, utils } from "ethers"
import Optimizer from ".."
import { Provider } from "@ethersproject/providers";
import { Factory, Factory__factory } from "../typechain";
import { expect } from "chai";

const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const BNB = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";
const UNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";

let provider: Provider;
let factory: Factory;

before(() => {
    provider = new providers.JsonRpcProvider("https://rpc.flashbots.net/");
    factory = Factory__factory.connect(UniswapFactoryAddress, provider);
})

let optimizer: Optimizer;
describe("UniswapV2PathOptimizer", async function(){
    before(async () => {
        optimizer = new Optimizer({
            provider,
            factoryAddress: UniswapFactoryAddress,
            routerAddress: UniswapRouterAddress,
        });
        await optimizer.init([
            WETH,
            USDC,
            USDT,
            DAI,
            WBTC,
            BNB,
            UNI,
            SUSHI
        ]);
        // optimizer.refresh();
    })
    
    it("add tokens", async function(){
        expect(optimizer.getToken(0).address).to.eq(WETH);
        expect(optimizer.getToken(1).address).to.eq(USDC);
        expect(optimizer.getToken(2).address).to.eq(USDT);
        expect(optimizer.getToken(3).address).to.eq(DAI);

        expect(optimizer.getPoolByAddress(USDC, USDT).address).to.eq(
            await factory.getPair(USDC, USDT)
        )
        expect(optimizer.getPoolByAddress(USDC, DAI).address).to.eq(
            await factory.getPair(USDC, DAI)
        )
        expect(optimizer.getPoolByAddress(DAI, USDT).address).to.eq(
            await factory.getPair(DAI, USDT)
        )
    })

    it("bfs", function(){
        const paths = optimizer.bfs(USDC, USDT, 10);
        expect(paths.length).to.eq(152);
        expect(paths[0]).to.deep.eq([1, 2]);
        expect(paths[1]).to.deep.eq([1, 0, 2]);
    })

    it("onChain:amountOut", async function () {
        const [from, to] = [USDC, WBTC];
        const amountIn = utils.parseUnits("1000", 6);
        const maxLength = 4;
        const optimalResult = await optimizer.getOptimalOutPathOnChain({
            from, to, amountIn, maxLength
        });
        expect(optimalResult.amountInWithToken().address).to.eq(from);
        expect(optimalResult.amountOutWithToken().address).to.eq(to);
        expect(optimalResult.path.length).to.lessThanOrEqual(maxLength)
    })

    it("onChain:amountIn", async function () {
        const [from, to] = [USDC, DAI];
        const amountOut = utils.parseUnits("1", 18);
        const maxLength = 4;
        const optimalResult = await optimizer.getOptimalInPathOnChain({
            from, to, amountOut, maxLength}
        );
        expect(optimalResult.amountInWithToken().address).to.eq(from);
        expect(optimalResult.amountOutWithToken().address).to.eq(to);
        expect(optimalResult.path.length).to.lessThanOrEqual(maxLength)
    })

    it.only("offChain:amountOut", async function () {
        const [from, to] = [USDC, WBTC];
        const amountIn = utils.parseUnits("10000", 6);
        const maxLength = 4;
        const optimalResult = optimizer.getOptimalOutPathOffChain({
            from, to, amountIn, maxLength
        });
        expect(optimalResult.amountInWithToken().address).to.eq(from);
        expect(optimalResult.amountOutWithToken().address).to.eq(to);
        expect(optimalResult.path.length).to.lessThanOrEqual(maxLength);
    })

    it("offChain:amountIn", async function () {
        const [from, to] = [WBTC, USDC];
        const amountOut = utils.parseUnits("1", 6);
        const maxLength = 4;
        const optimalResult = optimizer.getOptimalInPathOffChain({
            from, to, amountOut, maxLength
        });
        expect(optimalResult[0].address).to.eq(from);
        expect(optimalResult.amountOutWithToken().address).to.eq(to);
        expect(optimalResult.path.length).to.lessThanOrEqual(maxLength)

        const x = optimalResult.path[0]
    })
})