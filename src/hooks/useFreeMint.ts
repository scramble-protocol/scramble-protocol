import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, MintStatus } from '../types/index.js';
import type { CallResult } from 'opnet';
import { FREE_MINT_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_FREE_MINT } from '../config/demoData.js';

const MAX_CLAIMS = 5000n;

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

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
  const contracts = getContracts(network);

  const freeMintContract = useCustomContract(contracts.freeMint, FREE_MINT_ABI);

  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) return;
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!freeMintContract || !opnetAddress) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = freeMintContract as unknown as ContractMethods;

      try {
        const remainingMethod = methods['remaining'];
        if (!remainingMethod) {
          if (mountedRef.current) setIsLoading(false);
          return;
        }

        const remainingResult = await remainingMethod();

        let remaining = MAX_CLAIMS;
        if (remainingResult && !remainingResult.revert) {
          remaining = (remainingResult.properties as Record<string, bigint>)['remaining'] ?? MAX_CLAIMS;
        }
        const totalClaimed = MAX_CLAIMS - remaining;

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
  }, [freeMintContract, opnetAddress, blockHeight]);

  const claim = useCallback(async (): Promise<TransactionState> => {
    if (!freeMintContract || !address || !opnetAddress) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      setTxState({ status: 'simulating', message: 'Checking if you can claim...' });

      const methods = freeMintContract as unknown as ContractMethods;
      const claimMethod = methods['claim'];
      if (!claimMethod) {
        return { status: 'error', error: 'claim method not found on contract' };
      }

      const callResult = await claimMethod();

      if (callResult.revert) {
        const revertMsg = callResult.revert.toString();
        const friendly = revertMsg.toLowerCase().includes('already claimed')
          ? "You already claimed your free mint, don't be greedy! 🐷"
          : revertMsg;
        const errorState: TransactionState = {
          status: 'error',
          error: friendly,
        };
        setTxState(errorState);

        if (revertMsg.toLowerCase().includes('already claimed')) {
          setMintStatus((prev) =>
            prev ? { ...prev, claimed: true } : prev,
          );
          setCanClaim(false);
        }

        return errorState;
      }

      setTxState({ status: 'signing', message: 'Confirm in your wallet to claim 1,000 $EGG.' });

      const networkConfig = getNetworkConfig(network);
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
      const raw = err instanceof Error ? err.message : 'Claim transaction failed';
      const friendly = raw.toLowerCase().includes('already claimed')
        ? "You already claimed your free mint, don't be greedy! 🐷"
        : raw;
      const errorState: TransactionState = { status: 'error', error: friendly };
      setTxState(errorState);
      return errorState;
    }
  }, [freeMintContract, address, opnetAddress, network]);

  if (isDemoMode()) return DEMO_FREE_MINT;

  return { mintStatus, canClaim, claim, isLoading, txState };
}
