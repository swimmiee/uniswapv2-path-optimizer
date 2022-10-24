import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare namespace Multicall {
    type CallStruct = {
        target: PromiseOrValue<string>;
        callData: PromiseOrValue<BytesLike>;
    };
    type CallStructOutput = [string, string] & {
        target: string;
        callData: string;
    };
}
export interface MulticallInterface extends utils.Interface {
    functions: {
        "aggregate((address,bytes)[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "aggregate"): FunctionFragment;
    encodeFunctionData(functionFragment: "aggregate", values: [Multicall.CallStruct[]]): string;
    decodeFunctionResult(functionFragment: "aggregate", data: BytesLike): Result;
    events: {};
}
export interface Multicall extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MulticallInterface;
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
        aggregate(calls: Multicall.CallStruct[], overrides?: CallOverrides): Promise<[
            BigNumber,
            string[]
        ] & {
            blockNumber: BigNumber;
            returnData: string[];
        }>;
    };
    aggregate(calls: Multicall.CallStruct[], overrides?: CallOverrides): Promise<[
        BigNumber,
        string[]
    ] & {
        blockNumber: BigNumber;
        returnData: string[];
    }>;
    callStatic: {
        aggregate(calls: Multicall.CallStruct[], overrides?: CallOverrides): Promise<[
            BigNumber,
            string[]
        ] & {
            blockNumber: BigNumber;
            returnData: string[];
        }>;
    };
    filters: {};
    estimateGas: {
        aggregate(calls: Multicall.CallStruct[], overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        aggregate(calls: Multicall.CallStruct[], overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
