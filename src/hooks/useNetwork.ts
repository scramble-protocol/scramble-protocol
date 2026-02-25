import { useState, useCallback } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { ContractService } from '../services/ContractService.js';

interface NetworkState {
  readonly network: string;
}

export function useNetwork(): NetworkState {
  const walletContext = useWalletConnect();
  const [network, setNetwork] = useState<string>('testnet');

  const walletNetwork = walletContext.network?.network ?? null;

  const updateNetwork = useCallback((newNetwork: string): void => {
    ContractService.getInstance().clearCache();
    setNetwork(newNetwork);
  }, []);

  if (walletNetwork && walletNetwork !== network) {
    updateNetwork(walletNetwork);
  }

  return { network };
}
