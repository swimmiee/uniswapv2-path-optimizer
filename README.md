# uniswapv2-path-optimizer
Optimal swap path finder for UniswapV2-based AMM DEX model

# Installation
```bash
npm i uniswapv2-path-optimizer
```

# Initialize
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

# Optimal Path for largest amountOut
```ts
const optimalResult = optimizer.getOptimalInPathOffChain({
    from: USDC,     // address of ERC20 token 
    to: WBTC,       // address of ERC20 token 
    amountIn: '1000000', 
    maxLength: 4
});
```

# Optimal Path for smallest amountIn
```ts
const optimalResult = optimizer.getOptimalInPathOffChain({
    from: WBTC,     // address of ERC20 token 
    to: USDC,       // address of ERC20 token 
    amountOut: '1000000', 
    maxLength: 4
});
```

# Refresh tokens & pairs
```ts
await optimizer.refresh();
```


# Core Entities
## UniswapV2PathOptimizer
### functions for get tokens & pools
**`tokens(): Token[]`**  
**`pools(): Pool[]`**  
**`getToken(id: number): Token`**  
**`getTokenByAddress(address: address): Token|undefined`**  
**`getTokenId(address: address): number`**  
**`getPoolByTokenId(tokenAId: number, tokenBId: number): Pool`**  
**`getPoolByAddress(tokenA: address, tokenB: address): Pool`**   

### functions for setting
**`async init(tokens: address[]): Promise<void>`**  
fetch tokens & pools info from blockchain
**`async refresh()`**  
refresh pools' reserved amounts
**`setFee(tokenA: address, tokenB: address, newFeeBps: number)`**  
- change the feeBps of pool

### Calculate path on-chain
**`async getOutPathsOnChain(props: GetOutPathParams):Promise<AmountsOutResult[]>`**  
**`async getOptimalOutPathOnChain(props: GetOutPathParams):Promise<AmountsOutResult>`**  
**`async getInPathsOnChain(props: GetInPathParams):Promise<AmountsInResult[]>`**  
**`async getOptimalInPathOnChain(props: GetOptimalInPathParams):Promise<AmountsInResult>`**  

### Calculate path off-chain
**`getOutPathsOffChain(props: GetOutPathParams):AmountsOutResult[]`**  
**`getOptimalOutPathOffChain(props: GetOptimalOutPathParams):AmountsOutResult`**  
**`getInPathsOffChain(props: GetInPathParams):AmountsInResult[]`**  
**`getOptimalInPathOffChain(props: GetOptimalInPathParams):AmountsInResult`**  

### Basic calculator
**`quote(tokenInId: number, tokenOutId: number, amountIn: BigNumberish): BigNumber`**
**`getAmountOut(tokenAId: number, tokenBId: number, amountIn: BigNumberish, priceImpact?:boolean)`**  
`priceImpact: boolean` if false, calculates without considering the fee. `default: true`  

**`getAmountIn(tokenAId: number, tokenBId: number, amountOut: BigNumberish, priceImpact?:boolean)`**  
`priceImpact: boolean` if false, calculates without considering the fee. `default: true`  

**`getAmountsOut(amountIn: BigNumberish, path: number[], priceImpact?:boolean): BigNumber[]`**  
`priceImpact: boolean` if false, calculates without considering the fee. `default: true`  

**`getAmountsIn(amountOut: BigNumberish, path: number[], priceImpact?:boolean): BigNumber[]`**  
`priceImpact: boolean` if false, calculates without considering the fee. `default: true`  




## PathResult
extended by AmountsInResult, AmountsOutResult  

### Properties

| property  	| type                                   	|
|-----------	|----------------------------------------	|
| path      	| [TokenWithAmount[]](#tokenwithamount) 	|
| amountIn  	| BigNumber                             	|
| amountOut 	| BigNumber                              	|


### Methods  

**`format(): String[]`**  
returns array of formatted strings from amounts in `path` tokens using tokens' own decimals.  

**`formatWithoutPriceImpact(): String[]`**  
returns array of formatted strings from amountsWithoutPriceImpact in `path` tokens using tokens' own decimals.

**`priceImpactBps(): number`**  
returns price impact when swapping with `path` in basis point.  
ex) 1234 => 12.34% (0.1234) 

**`amountInWithToken():`[TokenWithAmount](#tokenwithamount)**  
returns amountIn amount with "from" token info.  

**`amountOutWithToken():`[TokenWithAmount](#tokenwithamount)**  
returns amountOut amount with "to" token info.


## TokenWithAmount
### Properties

| property                 	| type      	|
|--------------------------	|-----------	|
| address                  	| string    	|
| symbol                   	| string    	|
| decimals                 	| number    	|
| amount                   	| BigNumber 	|
| amountWithoutPriceImpact 	| BigNumber 	|


### Methods  

**`format(): string`**  
returns formatted string from `amount` using `decimals`.  

**`formatWithoutPriceImpact(): string`**
returns formatted string from `amountWithoutPriceImpact` using `decimals`.  
