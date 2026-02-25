import {
  getContract,
  OP_20_ABI,
  type BaseContract,
  type BaseContractProperties,
  type BitcoinInterfaceAbi,
  type JSONRpcProvider,
} from 'opnet';
import type { Address } from '@btc-vision/transaction';
import { type Network } from '@btc-vision/bitcoin';
import { getNetworkConfig } from '../config/networks.js';

type ContractInstance = BaseContract<BaseContractProperties> &
  Omit<BaseContractProperties, keyof BaseContract<BaseContractProperties>>;

class ContractService {
  private static instance: ContractService | undefined;
  private readonly cache: Map<string, ContractInstance> = new Map();
  private currentNetwork: string = 'testnet';

  private constructor() {}

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  setNetwork(networkName: string): void {
    this.currentNetwork = networkName;
  }

  private resolveNetwork(): Network {
    return getNetworkConfig(this.currentNetwork).network;
  }

  getOP20Contract(
    address: string,
    provider: JSONRpcProvider,
  ): ContractInstance {
    const key = this.buildKey(provider, address);
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const contract = getContract<BaseContractProperties>(
      address,
      OP_20_ABI,
      provider,
      this.resolveNetwork(),
    );

    this.cache.set(key, contract);
    return contract;
  }

  getCustomContract(
    address: string,
    provider: JSONRpcProvider,
    abi: BitcoinInterfaceAbi,
  ): ContractInstance {
    const key = this.buildKey(provider, address);
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const contract = getContract<BaseContractProperties>(
      address,
      abi,
      provider,
      this.resolveNetwork(),
    );

    this.cache.set(key, contract);
    return contract;
  }

  setSender(address: Address): void {
    for (const contract of this.cache.values()) {
      contract.setSender(address);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private buildKey(provider: JSONRpcProvider, address: string): string {
    return `${provider.url}:${address}`;
  }
}

export { ContractService };
export type { ContractInstance };
