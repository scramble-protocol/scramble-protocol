import { useEffect, useCallback, useMemo } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import type { Address } from '@btc-vision/transaction';
import { ContractService } from '../services/ContractService.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_WALLET } from '../config/demoData.js';

interface WalletState {
  readonly address: string | undefined;
  readonly opnetAddress: Address | null;
  readonly isConnected: boolean;
  readonly balance: bigint;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly network: string;
  readonly openConnectModal: () => void;
}

export function useWallet(): WalletState {
  const walletContext = useWalletConnect();

  const address = walletContext.walletAddress ?? undefined;
  const opnetAddress = walletContext.address ?? null;
  const isConnected = walletContext.walletAddress !== null;
  const network = walletContext.network?.network ?? 'testnet';

  const balance = useMemo((): bigint => {
    if (walletContext.walletBalance === null) {
      return 0n;
    }
    return BigInt(Math.floor(walletContext.walletBalance.confirmed));
  }, [walletContext.walletBalance]);

  useEffect(() => {
    if (isDemoMode()) return;
    if (opnetAddress) {
      try {
        ContractService.getInstance().setSender(opnetAddress);
      } catch {
        // setSender may fail if wallet address is not yet resolved
      }
    }
  }, [opnetAddress]);

  const connect = useCallback((): void => {
    walletContext.openConnectModal();
  }, [walletContext]);

  const disconnect = useCallback((): void => {
    walletContext.disconnect();
  }, [walletContext]);

  const openConnectModal = useCallback((): void => {
    walletContext.openConnectModal();
  }, [walletContext]);

  if (isDemoMode()) return DEMO_WALLET;

  return {
    address,
    opnetAddress,
    isConnected,
    balance,
    connect,
    disconnect,
    network,
    openConnectModal,
  };
}
