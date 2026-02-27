import { networks, type Network } from '@btc-vision/bitcoin';

interface NetworkConfig {
  readonly rpcUrl: string;
  readonly explorerUrl: string;
  readonly network: Network;
}

const NETWORK_CONFIGS: Map<string, NetworkConfig> = new Map([
  [
    'regtest',
    {
      rpcUrl: 'https://regtest.opnet.org',
      explorerUrl: 'https://opscan.org',
      network: networks.regtest,
    },
  ],
  [
    'testnet',
    {
      rpcUrl: 'https://testnet.opnet.org',
      explorerUrl: 'https://opscan.org',
      network: networks.opnetTestnet,
    },
  ],
  [
    'mainnet',
    {
      rpcUrl: 'https://api.opnet.org',
      explorerUrl: 'https://opscan.org',
      network: networks.bitcoin,
    },
  ],
]);

export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORK_CONFIGS.get(network);
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config;
}

export function getDefaultNetwork(): string {
  return 'testnet';
}

export type { NetworkConfig };
