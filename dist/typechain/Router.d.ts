import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface RouterInterface extends utils.Interface {
    functions: {
        "getAmountsIn(uint256,address[])": FunctionFragment;
        "getAmountsOut(uint256,address[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getAmountsIn" | "getAmountsOut"): FunctionFragment;
    encodeFunctionData(functionFragment: "getAmountsIn", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "getAmountsOut", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>[]]): string;
    decodeFunctionResult(functionFragment: "getAmountsIn", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAmountsOut", data: BytesLike): Result;
    events: {};
}
export interface Router extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: RouterInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        getAmountsIn(amountOut: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
        getAmountsOut(amountIn: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<[BigNumber[]] & {
            amounts: BigNumber[];
        }>;
    };
    getAmountsIn(amountOut: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    getAmountsOut(amountIn: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    callStatic: {
        getAmountsIn(amountOut: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber[]>;
        getAmountsOut(amountIn: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber[]>;
    };
    filters: {};
    estimateGas: {
        getAmountsIn(amountOut: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber>;
        getAmountsOut(amountIn: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        getAmountsIn(amountOut: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAmountsOut(amountIn: PromiseOrValue<BigNumberish>, path: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
