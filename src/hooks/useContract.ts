import { useMemo } from 'react';
import type { BitcoinInterfaceAbi } from 'opnet';
import type { ContractInstance } from '../services/ContractService.js';
import { ContractService } from '../services/ContractService.js';
import { useOPNetProvider } from './useOPNetProvider.js';
import { useWallet } from './useWallet.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';

export function useOP20Contract(address: string): ContractInstance | null {
  const { provider } = useOPNetProvider();
  const { opnetAddress } = useWallet();
  const { network } = useNetwork();

  const contract = useMemo((): ContractInstance | null => {
    if (!address) {
      return null;
    }

    try {
      const service = ContractService.getInstance();
      service.setNetwork(network);
      const instance = service.getOP20Contract(address, provider);

      if (opnetAddress && !isDemoMode()) {
        service.setSender(opnetAddress);
      }

      return instance;
    } catch {
      return null;
    }
  }, [address, provider, opnetAddress, network]);

  return contract;
}

export function useCustomContract(
  address: string,
  abi: BitcoinInterfaceAbi,
): ContractInstance | null {
  const { provider } = useOPNetProvider();
  const { opnetAddress } = useWallet();
  const { network } = useNetwork();

  const contract = useMemo((): ContractInstance | null => {
    if (!address) {
      return null;
    }

    try {
      const service = ContractService.getInstance();
      service.setNetwork(network);
      const instance = service.getCustomContract(address, provider, abi);

      if (opnetAddress && !isDemoMode()) {
        service.setSender(opnetAddress);
      }

      return instance;
    } catch {
      return null;
    }
  }, [address, provider, abi, opnetAddress, network]);

  return contract;
}
