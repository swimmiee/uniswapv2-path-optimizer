import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Pair, PairInterface } from "../Pair";
export declare class Pair__factory {
    static readonly abi: {
        inputs: never[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): PairInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Pair;
}
