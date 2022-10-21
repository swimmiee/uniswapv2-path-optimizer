import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ERC20, ERC20Interface } from "../ERC20";
export declare class ERC20__factory {
    static readonly abi: {
        constant: boolean;
        inputs: never[];
        name: string;
        outputs: {
            name: string;
            type: string;
        }[];
        payable: boolean;
        stateMutability: string;
        type: string;
    }[];
    static createInterface(): ERC20Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): ERC20;
}
