import { useMemo } from 'react';
import type { BitcoinInterfaceAbi } from 'opnet';
import type { ContractInstance } from '../services/ContractService.js';
import { ContractService } from '../services/ContractService.js';
import { useOPNetProvider } from './useOPNetProvider.js';
import { useWallet } from './useWallet.js';

export function useOP20Contract(address: string): ContractInstance | null {
  const { provider } = useOPNetProvider();
  const { address: walletAddress } = useWallet();

  const contract = useMemo((): ContractInstance | null => {
    if (!address) {
      return null;
    }

    try {
      const instance = ContractService.getInstance().getOP20Contract(address, provider);

      if (walletAddress) {
        ContractService.getInstance().setSender(walletAddress);
      }

      return instance;
    } catch {
      return null;
    }
  }, [address, provider, walletAddress]);

  return contract;
}

export function useCustomContract(
  address: string,
  abi: BitcoinInterfaceAbi,
): ContractInstance | null {
  const { provider } = useOPNetProvider();
  const { address: walletAddress } = useWallet();

  const contract = useMemo((): ContractInstance | null => {
    if (!address) {
      return null;
    }

    try {
      const instance = ContractService.getInstance().getCustomContract(address, provider, abi);

      if (walletAddress) {
        ContractService.getInstance().setSender(walletAddress);
      }

      return instance;
    } catch {
      return null;
    }
  }, [address, provider, abi, walletAddress]);

  return contract;
}
