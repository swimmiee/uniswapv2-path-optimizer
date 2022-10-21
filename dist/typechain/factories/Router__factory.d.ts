import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Router, RouterInterface } from "../Router";
export declare class Router__factory {
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
    static createInterface(): RouterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Router;
}
