import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, FarmPosition } from '../types/index.js';
import type { CallResult } from 'opnet';
import { LP_MINING_REWARDS_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract, useOP20Contract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_LP_MINING } from '../config/demoData.js';

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

interface LPMiningState {
  readonly position: FarmPosition | null;
  readonly stakeLP: (amount: bigint) => Promise<TransactionState>;
  readonly unstakeLP: (amount: bigint) => Promise<TransactionState>;
  readonly claimRewards: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export function useLPMining(): LPMiningState {
  const { network } = useNetwork();
  const { address, opnetAddress } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);

  const lpMiningContract = useCustomContract(contracts.lpMiningRewards, LP_MINING_REWARDS_ABI);
  const lpTokenContract = useOP20Contract(contracts.motoSwapRouter);

  const [position, setPosition] = useState<FarmPosition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    if (isDemoMode()) return;
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!lpMiningContract || !opnetAddress) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = lpMiningContract as unknown as ContractMethods;

      try {
        if (methods['getPosition']) {
          const posResult = await methods['getPosition'](opnetAddress);
          if (mountedRef.current && posResult && !posResult.revert) {
            const props = posResult.properties as Record<string, bigint>;
            setPosition({
              staked: props['staked'] ?? 0n,
              pendingEgg: props['pendingEgg'] ?? 0n,
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
  }, [lpMiningContract, opnetAddress, blockHeight]);

  const executeTransaction = useCallback(
    async (methodName: string, args: unknown[]): Promise<TransactionState> => {
      if (!lpMiningContract || !address) {
        return { status: 'error', error: 'Wallet not connected or contract not loaded' };
      }

      const methods = lpMiningContract as unknown as ContractMethods;
      const method = methods[methodName];

      if (!method) {
        return { status: 'error', error: `Method ${methodName} not found on contract` };
      }

      try {
        setTxState({ status: 'simulating' });
        const simulationResult = await method(...args);

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
        const message = err instanceof Error ? err.message : 'Transaction failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [lpMiningContract, address, network],
  );

  const approveLPToken = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!lpTokenContract || !address) {
        return { status: 'error', error: 'Wallet not connected or LP token contract not loaded' };
      }

      try {
        setTxState({ status: 'approving' });
        const methods = lpTokenContract as unknown as ContractMethods;
        const approveMethod = methods['approve'];

        if (!approveMethod) {
          return { status: 'error', error: 'Approve method not found on LP token contract' };
        }

        const simulationResult = await approveMethod(contracts.lpMiningRewards, amount);

        if (simulationResult.revert) {
          const errorState: TransactionState = {
            status: 'error',
            error: simulationResult.revert.toString(),
          };
          setTxState(errorState);
          return errorState;
        }

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

        if (!result.transactionId) {
          return { status: 'error', error: 'LP token approval transaction failed' };
        }

        return { status: 'confirmed', txId: result.transactionId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'LP token approval failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [lpTokenContract, address, contracts.lpMiningRewards, network],
  );

  const stakeLP = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      const approvalResult = await approveLPToken(amount);
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return executeTransaction('stakeLP', [amount]);
    },
    [approveLPToken, executeTransaction],
  );

  const unstakeLP = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      return executeTransaction('unstakeLP', [amount]);
    },
    [executeTransaction],
  );

  const claimRewards = useCallback(async (): Promise<TransactionState> => {
    return executeTransaction('claimRewards', []);
  }, [executeTransaction]);

  if (isDemoMode()) return DEMO_LP_MINING;

  return { position, stakeLP, unstakeLP, claimRewards, isLoading, txState };
}
