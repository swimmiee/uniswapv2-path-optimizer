# uniswapv2-path-optimizer
Optimal swap path finder for UniswapV2-based AMM DEX model

## Installation
```bash
npm i uniswapv2-path-optimizer
```

## Initialize
```ts
import Optimizer from "uniswapv2-path-optimizer";
const provider = new providers.JsonRpcProvider("RPC_NODE_URL");
const UniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const UniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const optimizer = new Optimizer({
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
```

## Optimal Path for smallest amountIn
```ts
const optimalResult = optimizer.getOptimalInPathOffChain({
    from: WBTC,     // address of ERC20 token 
    to: USDC,       // address of ERC20 token 
    amountOut: '1000000', 
    maxLength: 4
});
```

## Refresh tokens & pairs
```ts
await optimizer.refresh();
```


## Core Entities
### PathResult
extended by AmountsInResult, AmountsOutResult  

**Properties**

| property  	| type                                   	|
|-----------	|----------------------------------------	|
| path      	| [TokenWithAmount[]](#tokenwithamount) 	|
| amountIn  	| BigNumber                             	|
| amountOut 	| BigNumber                              	|

**Methods**  

**`format(): String[]`**  
returns array of formatted strings from amounts in `path` tokens using tokens' own decimals.  

**`formatWithoutPriceImpact(): String[]`**  
returns array of formatted strings from amountsWithoutPriceImpact in `path` tokens using tokens' own decimals.

**`priceImpactBps(): number`**  
returns price impact when swapping with `path` in basis point.  
ex) 1234 => 12.34% (0.1234) 

**`amountInWithToken(): [TokenWithAmount](#tokenwithamount)`**  
returns amountIn amount with "from" token info.  

**`amountOutWithToken(): [TokenWithAmount](#tokenwithamount)`**  
returns amountOut amount with "to" token info.


### TokenWithAmount
**Properties**

| property                 	| type      	|
|--------------------------	|-----------	|
| address                  	| string    	|
| symbol                   	| string    	|
| decimals                 	| number    	|
| amount                   	| BigNumber 	|
| amountWithoutPriceImpact 	| BigNumber 	|

**Methods**  

**`format(): string`**  
returns formatted string from `amount` using `decimals`.  

**`formatWithoutPriceImpact(): string`**
returns formatted string from `amountWithoutPriceImpact` using `decimals`.  
