import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";
export interface PairInterface extends utils.Interface {
    functions: {
        "getReserves()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getReserves"): FunctionFragment;
    encodeFunctionData(functionFragment: "getReserves", values?: undefined): string;
    decodeFunctionResult(functionFragment: "getReserves", data: BytesLike): Result;
    events: {};
}
export interface Pair extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: PairInterface;
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
        getReserves(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            number
        ] & {
            _reserve0: BigNumber;
            _reserve1: BigNumber;
            _blockTimestampLast: number;
        }>;
    };
    getReserves(overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber,
        number
    ] & {
        _reserve0: BigNumber;
        _reserve1: BigNumber;
        _blockTimestampLast: number;
    }>;
    callStatic: {
        getReserves(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            number
        ] & {
            _reserve0: BigNumber;
            _reserve1: BigNumber;
            _blockTimestampLast: number;
        }>;
    };
    filters: {};
    estimateGas: {
        getReserves(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        getReserves(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
