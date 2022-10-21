import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Factory, FactoryInterface } from "../Factory";
export declare class Factory__factory {
    static readonly abi: {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): FactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Factory;
}
