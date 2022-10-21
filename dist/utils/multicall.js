"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multicallAddressBook_1 = __importDefault(require("./multicallAddressBook"));
const typechain_1 = require("../typechain");
function multicall(calls, provider, multicallAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Set Multicall
        let multicallContract;
        if (!multicallAddress) {
            const { chainId, name } = yield provider.getNetwork();
            if (chainId in multicallAddressBook_1.default) {
                multicallContract = typechain_1.Multicall__factory.connect(multicallAddressBook_1.default[chainId], provider);
            }
            else {
                throw Error(`No multicall address for ${name} chain`);
            }
        }
        else {
            multicallContract = typechain_1.Multicall__factory.connect(multicallAddress, provider);
        }
        // encode
        const callStructs = calls.map(({ interfaceObject, address, method, args }) => ({
            target: address,
            callData: interfaceObject.encodeFunctionData(method, args)
        }));
        // call
        const { returnData } = yield multicallContract.aggregate(callStructs);
        // decode
        return calls.map(({ interfaceObject, method, args }, i) => {
            return interfaceObject.decodeFunctionResult(method, returnData[i]);
        });
    });
}
exports.default = multicall;
