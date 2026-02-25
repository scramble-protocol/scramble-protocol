import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, HarvestInfo } from '../types/index.js';
import type { CallResult } from 'opnet';
import { THE_SPATULA_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_SPATULA } from '../config/demoData.js';

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

interface SpatulaState {
  readonly harvestInfo: HarvestInfo | null;
  readonly harvest: (minAmountOut: bigint) => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export function useSpatula(): SpatulaState {
  const { network } = useNetwork();
  const { address, opnetAddress } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);

  const spatulaContract = useCustomContract(contracts.theSpatula, THE_SPATULA_ABI);

  const [harvestInfo, setHarvestInfo] = useState<HarvestInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) return;
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!spatulaContract || !opnetAddress) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = spatulaContract as unknown as ContractMethods;

      try {
        if (methods['getHarvestInfo']) {
          const infoResult = await methods['getHarvestInfo'](opnetAddress);
          if (mountedRef.current && infoResult && !infoResult.revert) {
            const props = infoResult.properties as Record<string, bigint>;
            setHarvestInfo({
              pendingAmount: props['pendingAmount'] ?? 0n,
              bountyPercent: props['bountyPercent'] ?? 0n,
              lastHarvestBlock: props['lastHarvestBlock'] ?? 0n,
            });
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
  }, [spatulaContract, opnetAddress, blockHeight]);

  const harvest = useCallback(
    async (minAmountOut: bigint): Promise<TransactionState> => {
      if (!spatulaContract || !address) {
        return { status: 'error', error: 'Wallet not connected or contract not loaded' };
      }

      const methods = spatulaContract as unknown as ContractMethods;
      const harvestMethod = methods['harvest'];

      if (!harvestMethod) {
        return { status: 'error', error: 'Harvest method not found on contract' };
      }

      try {
        setTxState({ status: 'simulating' });
        const simulationResult = await harvestMethod(minAmountOut);

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
        const message = err instanceof Error ? err.message : 'Harvest transaction failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [spatulaContract, address, network],
  );

  if (isDemoMode()) return DEMO_SPATULA;

  return { harvestInfo, harvest, isLoading, txState };
}
