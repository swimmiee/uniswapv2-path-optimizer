import { Provider } from '@ethersproject/abstract-provider';
import { address, MulticallCallDataInput } from '../types';
declare function multicall<T>(calls: MulticallCallDataInput[], provider: Provider, multicallAddress?: address): Promise<T[]>;
export default multicall;
