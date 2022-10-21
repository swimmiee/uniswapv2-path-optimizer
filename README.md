# uniswapv2-path-optimizer
Optimal swap path finder for UniswapV2-based AMM DEX model

## Installation
```bash
npm i uniswapv2-path-optimizer
```

## Initialize
```ts
const provider = new providers.JsonRpcProvider("RPC_NODE_URL");
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const optimizer = new UniswapV2PathOptimizer({
    provider,
    factoryAddress: UniswapFactoryAddress,
    routerAddress: UniswapRouterAddress,
});

const WETH = "0x...";
const USDC = "0x...";
// and so on...

// method `optimizer.init` is async function to get token & pair info from blockchain.
// initiate for target tokens, 
// Each element of the array is address of ERC20 tokens
await optimizer.init([WETH, USDC, USDT, DAI, WBTC, BNB, UNI, SUSHI]);
```

## Optimal Path for largest amountOut
```ts
const optimalResult = optimizer.getOptimalInPathOffChain({
    from: USDC,     // address of ERC20 token 
    to: WBTC,       // address of ERC20 token 
    amountIn: '1000000', 
    maxLength: 4
});
/** 
[
  TokenWithAmount {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    amount: BigNumber { _hex: '0x0f4240', _isBigNumber: true }
  },
  TokenWithAmount {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
    amount: BigNumber { _hex: '0x1494', _isBigNumber: true }
  },
  formatted: [ '1.0', '0.00005268' ],
  amountOut: BigNumber { _hex: '0x1494', _isBigNumber: true },
  priceImpactBps: 12
]
*/
```

## Optimal Path for smallest amountIn
```ts
const optimalResult = optimizer.getOptimalInPathOffChain({
    from: WBTC,     // address of ERC20 token 
    to: USDC,       // address of ERC20 token 
    amountOut: '1000000', 
    maxLength: 4
});
/**
[
  TokenWithAmount {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
    amount: BigNumber { _hex: '0x14b5', _isBigNumber: true }
  },
  TokenWithAmount {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    amount: BigNumber { _hex: '0x0f4240', _isBigNumber: true }
  },
  formatted: [ '0.00005301', '1.0' ],
  amountIn: BigNumber { _hex: '0x14b5', _isBigNumber: true },
  priceImpactBps: 10000
]
*/
```

## Refresh tokens & pairs
```ts
await optimizer.refresh();
```
