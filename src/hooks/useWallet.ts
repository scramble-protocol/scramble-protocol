import { useEffect, useCallback, useMemo } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { ContractService } from '../services/ContractService.js';

interface WalletState {
  readonly address: string | undefined;
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
  const isConnected = walletContext.walletAddress !== null;
  const network = walletContext.network?.network ?? 'regtest';

  const balance = useMemo((): bigint => {
    if (walletContext.walletBalance === null) {
      return 0n;
    }
    return BigInt(Math.floor(walletContext.walletBalance.confirmed));
  }, [walletContext.walletBalance]);

  useEffect(() => {
    if (address) {
      ContractService.getInstance().setSender(address);
    }
  }, [address]);

  const connect = useCallback((): void => {
    walletContext.openConnectModal();
  }, [walletContext]);

  const disconnect = useCallback((): void => {
    walletContext.disconnect();
  }, [walletContext]);

  const openConnectModal = useCallback((): void => {
    walletContext.openConnectModal();
  }, [walletContext]);

  return {
    address,
    isConnected,
    balance,
    connect,
    disconnect,
    network,
    openConnectModal,
  };
}
