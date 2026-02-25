import { useState, useEffect, useRef } from 'react';
import { useOPNetProvider } from './useOPNetProvider.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_BLOCK } from '../config/demoData.js';

const POLL_INTERVAL_MS = 30_000;

interface BlockHeightState {
  readonly blockHeight: bigint;
  readonly isLoading: boolean;
}

export function useBlockHeight(): BlockHeightState {
  const { provider } = useOPNetProvider();
  const [blockHeight, setBlockHeight] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) return;
    mountedRef.current = true;

    const fetchBlockHeight = async (): Promise<void> => {
      try {
        const height = await provider.getBlockNumber();
        if (mountedRef.current) {
          setBlockHeight(BigInt(height));
          setIsLoading(false);
        }
      } catch {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void fetchBlockHeight();

    const intervalId = setInterval((): void => {
      void fetchBlockHeight();
    }, POLL_INTERVAL_MS);

    return (): void => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [provider]);

  if (isDemoMode()) return DEMO_BLOCK;

  return { blockHeight, isLoading };
}
