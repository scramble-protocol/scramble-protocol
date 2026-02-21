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
  const { address } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);

  const freeMintContract = useCustomContract(contracts.freeMint, FREE_MINT_ABI);

  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!freeMintContract || !address) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = freeMintContract as unknown as ContractMethods;

      try {
        if (methods['getMintStatus']) {
          const statusResult = await methods['getMintStatus'](address);
          if (mountedRef.current && statusResult && !statusResult.revert) {
            const props = statusResult.properties as Record<string, boolean | bigint>;
            setMintStatus({
              claimed: typeof props['claimed'] === 'boolean' ? props['claimed'] : false,
              totalClaimed: typeof props['totalClaimed'] === 'bigint' ? props['totalClaimed'] : 0n,
              maxClaims: typeof props['maxClaims'] === 'bigint' ? props['maxClaims'] : 0n,
            });
          }
        }

        if (methods['canClaim']) {
          const canClaimResult = await methods['canClaim'](address);
          if (mountedRef.current && canClaimResult && !canClaimResult.revert) {
            const props = canClaimResult.properties as Record<string, boolean>;
            setCanClaim(props['canClaim'] ?? false);
          }
        }
      } catch {
        // Contract calls may fail with placeholder ABIs
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    void fetchData();

    return (): void => {
      mountedRef.current = false;
    };
  }, [freeMintContract, address, blockHeight]);

  const claim = useCallback(async (): Promise<TransactionState> => {
    if (!freeMintContract || !address) {
      return { status: 'error', error: 'Wallet not connected or contract not loaded' };
    }

    const methods = freeMintContract as unknown as ContractMethods;
    const claimMethod = methods['claim'];

    if (!claimMethod) {
      return { status: 'error', error: 'Claim method not found on contract' };
    }

    try {
      setTxState({ status: 'simulating' });
      const simulationResult = await claimMethod();

      if (simulationResult.revert) {
        const errorState: TransactionState = {
          status: 'error',
          error: simulationResult.revert.toString(),
        };
        setTxState(errorState);
        return errorState;
      }

      setTxState({ status: 'signing' });
      const networkConfig = getNetworkConfig(network);

      const result = await simulationResult.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: address,
        maximumAllowedSatToSpend: 1_000_000n,
        feeRate: 1,
        priorityFee: 50_000n,
        network: networkConfig.network,
      });

      setTxState({ status: 'broadcasting' });
      const confirmedState: TransactionState = {
        status: 'confirmed',
        txId: result.transactionId,
      };
      setTxState(confirmedState);
      return confirmedState;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Claim transaction failed';
      const errorState: TransactionState = { status: 'error', error: message };
      setTxState(errorState);
      return errorState;
    }
  }, [freeMintContract, address, network]);

  return { mintStatus, canClaim, claim, isLoading, txState };
}
