import { JSONRpcProvider } from 'opnet';
import { getNetworkConfig } from '../config/networks.js';

class ProviderService {
  private static instance: ProviderService | undefined;
  private readonly cache: Map<string, JSONRpcProvider> = new Map();

  private constructor() {}

  static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService();
    }
    return ProviderService.instance;
  }

  getProvider(network: string): JSONRpcProvider {
    const cached = this.cache.get(network);
    if (cached) {
      return cached;
    }

    const config = getNetworkConfig(network);
    const provider = new JSONRpcProvider({
      url: config.rpcUrl,
      network: config.network,
    });

    this.cache.set(network, provider);
    return provider;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export { ProviderService };
