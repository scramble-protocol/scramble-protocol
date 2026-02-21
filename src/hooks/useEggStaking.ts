import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, StakingPosition } from '../types/index.js';
import type { CallResult } from 'opnet';
import { EGG_STAKING_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract, useOP20Contract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

interface EggStakingState {
  readonly position: StakingPosition | null;
  readonly stake: (amount: bigint) => Promise<TransactionState>;
  readonly unstake: (amount: bigint) => Promise<TransactionState>;
  readonly claimRewards: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export function useEggStaking(): EggStakingState {
  const { network } = useNetwork();
  const { address } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);

  const stakingContract = useCustomContract(contracts.eggStaking, EGG_STAKING_ABI);
  const eggContract = useOP20Contract(contracts.eggToken);

  const [position, setPosition] = useState<StakingPosition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!stakingContract || !address) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = stakingContract as unknown as ContractMethods;

      try {
        if (methods['getPosition']) {
          const posResult = await methods['getPosition'](address);
          if (mountedRef.current && posResult && !posResult.revert) {
            const props = posResult.properties as Record<string, bigint>;
            setPosition({
              staked: props['staked'] ?? 0n,
              pendingRewards: props['pendingRewards'] ?? 0n,
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
  }, [stakingContract, address, blockHeight]);

  const executeTransaction = useCallback(
    async (methodName: string, args: unknown[]): Promise<TransactionState> => {
      if (!stakingContract || !address) {
        return { status: 'error', error: 'Wallet not connected or contract not loaded' };
      }

      const methods = stakingContract as unknown as ContractMethods;
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
    [stakingContract, address, network],
  );

  const approveEgg = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!eggContract || !address) {
        return { status: 'error', error: 'Wallet not connected or EGG contract not loaded' };
      }

      try {
        setTxState({ status: 'approving' });
        const methods = eggContract as unknown as ContractMethods;
        const approveMethod = methods['approve'];

        if (!approveMethod) {
          return { status: 'error', error: 'Approve method not found on EGG contract' };
        }

        const simulationResult = await approveMethod(contracts.eggStaking, amount);

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
          return { status: 'error', error: 'Approval transaction failed' };
        }

        return { status: 'confirmed', txId: result.transactionId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'EGG approval failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [eggContract, address, contracts.eggStaking, network],
  );

  const stake = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      const approvalResult = await approveEgg(amount);
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return executeTransaction('stake', [amount]);
    },
    [approveEgg, executeTransaction],
  );

  const unstake = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      return executeTransaction('unstake', [amount]);
    },
    [executeTransaction],
  );

  const claimRewards = useCallback(async (): Promise<TransactionState> => {
    return executeTransaction('claimRewards', []);
  }, [executeTransaction]);

  return { position, stake, unstake, claimRewards, isLoading, txState };
}
