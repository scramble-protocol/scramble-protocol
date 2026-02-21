import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, VaultPosition, VaultStats } from '../types/index.js';
import type { CallResult } from 'opnet';
import { THE_PAN_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract, useOP20Contract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

interface ThePanState {
  readonly position: VaultPosition | null;
  readonly stats: VaultStats | null;
  readonly deposit: (amount: bigint) => Promise<TransactionState>;
  readonly withdraw: (shares: bigint) => Promise<TransactionState>;
  readonly claimSizzle: () => Promise<TransactionState>;
  readonly depositEggBoost: (amount: bigint) => Promise<TransactionState>;
  readonly withdrawEggBoost: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export function useThePan(): ThePanState {
  const { network } = useNetwork();
  const { address } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);

  const panContract = useCustomContract(contracts.thePan, THE_PAN_ABI);
  const motoContract = useOP20Contract(contracts.motoToken);
  const eggContract = useOP20Contract(contracts.eggToken);

  const [position, setPosition] = useState<VaultPosition | null>(null);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [txState, setTxState] = useState<TransactionState>({ status: 'idle' });
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!panContract) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = panContract as unknown as ContractMethods;

      try {
        if (address && methods['getPosition']) {
          const posResult = await methods['getPosition'](address);
          if (mountedRef.current && posResult && !posResult.revert) {
            const props = posResult.properties as Record<string, bigint | number>;
            setPosition({
              shells: typeof props['shells'] === 'bigint' ? props['shells'] : 0n,
              eggBoost: typeof props['eggBoost'] === 'bigint' ? props['eggBoost'] : 0n,
              depositBlock: typeof props['depositBlock'] === 'bigint' ? props['depositBlock'] : 0n,
              cookLevel: typeof props['cookLevel'] === 'number' ? props['cookLevel'] : 0,
              pendingSizzle: typeof props['pendingSizzle'] === 'bigint' ? props['pendingSizzle'] : 0n,
            });
          }
        }

        if (methods['getStats']) {
          const statsResult = await methods['getStats']();
          if (mountedRef.current && statsResult && !statsResult.revert) {
            const props = statsResult.properties as Record<string, bigint>;
            setStats({
              tvl: props['tvl'] ?? 0n,
              totalShells: props['totalShells'] ?? 0n,
              butterLevel: props['butterLevel'] ?? 0n,
              sizzleRate: props['sizzleRate'] ?? 0n,
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
  }, [panContract, address, blockHeight]);

  const executeTransaction = useCallback(
    async (
      contractMethods: ContractMethods,
      methodName: string,
      args: unknown[],
    ): Promise<TransactionState> => {
      if (!address) {
        return { status: 'error', error: 'Wallet not connected' };
      }

      const method = contractMethods[methodName];
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
    [address, network],
  );

  const approveToken = useCallback(
    async (
      tokenContract: unknown,
      spender: string,
      amount: bigint,
    ): Promise<TransactionState> => {
      if (!address || !tokenContract) {
        return { status: 'error', error: 'Wallet not connected or token contract not loaded' };
      }

      try {
        setTxState({ status: 'approving' });
        const methods = tokenContract as ContractMethods;
        const approveMethod = methods['approve'];

        if (!approveMethod) {
          return { status: 'error', error: 'Approve method not found on token contract' };
        }

        const simulationResult = await approveMethod(spender, amount);

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
        const message = err instanceof Error ? err.message : 'Approval failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [address, network],
  );

  const deposit = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!panContract || !motoContract) {
        return { status: 'error', error: 'Contracts not loaded' };
      }

      const approvalResult = await approveToken(motoContract, contracts.thePan, amount);
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return executeTransaction(
        panContract as unknown as ContractMethods,
        'deposit',
        [amount],
      );
    },
    [panContract, motoContract, contracts.thePan, approveToken, executeTransaction],
  );

  const withdraw = useCallback(
    async (shares: bigint): Promise<TransactionState> => {
      if (!panContract) {
        return { status: 'error', error: 'Contract not loaded' };
      }

      return executeTransaction(
        panContract as unknown as ContractMethods,
        'withdraw',
        [shares],
      );
    },
    [panContract, executeTransaction],
  );

  const claimSizzle = useCallback(async (): Promise<TransactionState> => {
    if (!panContract) {
      return { status: 'error', error: 'Contract not loaded' };
    }

    return executeTransaction(
      panContract as unknown as ContractMethods,
      'claimSizzle',
      [],
    );
  }, [panContract, executeTransaction]);

  const depositEggBoost = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!panContract || !eggContract) {
        return { status: 'error', error: 'Contracts not loaded' };
      }

      const approvalResult = await approveToken(eggContract, contracts.thePan, amount);
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return executeTransaction(
        panContract as unknown as ContractMethods,
        'depositEggBoost',
        [amount],
      );
    },
    [panContract, eggContract, contracts.thePan, approveToken, executeTransaction],
  );

  const withdrawEggBoost = useCallback(async (): Promise<TransactionState> => {
    if (!panContract) {
      return { status: 'error', error: 'Contract not loaded' };
    }

    return executeTransaction(
      panContract as unknown as ContractMethods,
      'withdrawEggBoost',
      [],
    );
  }, [panContract, executeTransaction]);

  return {
    position,
    stats,
    deposit,
    withdraw,
    claimSizzle,
    depositEggBoost,
    withdrawEggBoost,
    isLoading,
    txState,
  };
}
