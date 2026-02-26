import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, MintStatus } from '../types/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useOPNetProvider } from './useOPNetProvider.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_FREE_MINT } from '../config/demoData.js';
import { callView, callWrite } from '../services/RawContractService.js';

const MAX_CLAIMS = 5000n;

interface FreeMintState {
  readonly mintStatus: MintStatus | null;
  readonly canClaim: boolean;
  readonly claim: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export function useFreeMint(): FreeMintState {
  const { network } = useNetwork();
  const { address, opnetAddress } = useWallet();
  const { blockHeight } = useBlockHeight();
  const { provider } = useOPNetProvider();
  const contracts = getContracts(network);

  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) return;
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!opnetAddress) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Call remaining() to get how many claims are left
        const remainingResult = await callView(
          provider,
          contracts.freeMint,
          opnetAddress,
          'remaining',
        );

        let remaining = MAX_CLAIMS;
        if (remainingResult.result) {
          remaining = remainingResult.result.readU256();
        }
        const totalClaimed = MAX_CLAIMS - remaining;

        // We can't check hasClaimed on-chain (no view method for it),
        // and simulating claim() fails if the contract lacks EGG balance.
        // So just enable the button if remaining > 0. If the user already
        // claimed or the contract has no balance, the real tx will revert
        // with a clear error message.
        if (mountedRef.current) {
          setMintStatus({
            claimed: false,
            totalClaimed,
            maxClaims: MAX_CLAIMS,
          });
          setCanClaim(remaining > 0n);
        }
      } catch (err) {
        console.error('[FreeMint] fetchData error:', err);
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    void fetchData();

    return (): void => {
      mountedRef.current = false;
    };
  }, [provider, contracts.freeMint, opnetAddress, blockHeight]);

  const claim = useCallback(async (): Promise<TransactionState> => {
    if (!address || !opnetAddress) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      setTxState({ status: 'simulating', message: 'Checking if you can claim...' });
      const networkConfig = getNetworkConfig(network);

      const callResult = await callWrite(
        provider,
        contracts.freeMint,
        opnetAddress,
        networkConfig.network,
        'claim',
      );

      if (callResult.revert) {
        const revertMsg = callResult.revert.toString();
        const errorState: TransactionState = {
          status: 'error',
          error: revertMsg,
        };
        setTxState(errorState);

        // Update claimed state if the revert tells us they already claimed
        if (revertMsg.toLowerCase().includes('already claimed')) {
          setMintStatus((prev) =>
            prev ? { ...prev, claimed: true } : prev,
          );
          setCanClaim(false);
        }

        return errorState;
      }

      setTxState({ status: 'signing', message: 'Confirm in your wallet to claim 1,000 $EGG.' });

      const result = await callResult.sendTransaction({
          signer: null,
          mldsaSigner: null,
        linkMLDSAPublicKeyToAddress: false,
        refundTo: address,
        maximumAllowedSatToSpend: 1_000_000n,
        feeRate: 1,
        priorityFee: 50_000n,
        network: networkConfig.network,
      });

      setTxState({ status: 'broadcasting', message: 'Sending your claim transaction...' });

      // Optimistically update UI
      setMintStatus((prev) =>
        prev
          ? { ...prev, claimed: true, totalClaimed: prev.totalClaimed + 1n }
          : prev,
      );
      setCanClaim(false);

      const confirmedState: TransactionState = {
        status: 'confirmed',
        txId: result.transactionId,
        message: 'You claimed 1,000 $EGG! Welcome to the kitchen.',
      };
      setTxState(confirmedState);
      return confirmedState;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Claim transaction failed';
      const errorState: TransactionState = { status: 'error', error: message };
      setTxState(errorState);
      return errorState;
    }
  }, [address, opnetAddress, provider, contracts.freeMint, network]);

  if (isDemoMode()) return DEMO_FREE_MINT;

  return { mintStatus, canClaim, claim, isLoading, txState };
}
