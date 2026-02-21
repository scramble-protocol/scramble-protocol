import { useMemo } from 'react';
import type { JSONRpcProvider } from 'opnet';
import { ProviderService } from '../services/ProviderService.js';
import { useNetwork } from './useNetwork.js';

interface OPNetProviderState {
  readonly provider: JSONRpcProvider;
}

export function useOPNetProvider(): OPNetProviderState {
  const { network } = useNetwork();

  const provider = useMemo((): JSONRpcProvider => {
    return ProviderService.getInstance().getProvider(network);
  }, [network]);

  return { provider };
}
