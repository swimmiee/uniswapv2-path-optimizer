import { Provider } from '@ethersproject/abstract-provider';
import multicallAddressBook from './multicallAddressBook';
import { Multicall, Multicall__factory } from '../typechain';
import { address, MulticallCallDataInput } from '../types';

async function multicall<T>(
    calls: MulticallCallDataInput[],
    provider: Provider,
    multicallAddress?: address,
):Promise<T[]>{
    // Set Multicall
    let multicallContract:Multicall;
    if(!multicallAddress){
        const { chainId, name } = await provider.getNetwork();
        if(chainId in multicallAddressBook){
            multicallContract = Multicall__factory.connect(multicallAddressBook[chainId], provider);
        } else {
            throw Error(`No multicall address for ${name} chain`);
        }
    } else {
        multicallContract = Multicall__factory.connect(multicallAddress, provider);
    }

    // encode
    const callStructs:Multicall.CallStruct[] = calls.map(
        ({interfaceObject, address, method, args}) => ({
            target: address, 
            callData: interfaceObject.encodeFunctionData(method, args)
        })
    )

    // call
    const { returnData } = await multicallContract.aggregate(callStructs);

    // decode
    return calls.map(({interfaceObject, method, args}, i) => {
        return interfaceObject.decodeFunctionResult(method, returnData[i]) as T;
    })
}

export default multicall;