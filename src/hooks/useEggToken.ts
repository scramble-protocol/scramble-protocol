import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState } from '../types/index.js';
import type { CallResult } from 'opnet';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useOP20Contract } from './useContract.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';

type ContractMethod = (...args: unknown[]) => Promise<CallResult>;
type ContractMethods = Record<string, ContractMethod>;

interface EggTokenState {
  readonly balance: bigint;
  readonly totalSupply: bigint;
  readonly increaseAllowance: (spender: string, amount: bigint) => Promise<TransactionState>;
  readonly isLoading: boolean;
}

export function useEggToken(): EggTokenState {
  const { network } = useNetwork();
  const { address } = useWallet();
  const { blockHeight } = useBlockHeight();
  const contracts = getContracts(network);
  const eggContract = useOP20Contract(contracts.eggToken);

  const [balance, setBalance] = useState<bigint>(0n);
  const [totalSupply, setTotalSupply] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      if (!eggContract) {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const methods = eggContract as unknown as ContractMethods;

      try {
        if (address && methods['balanceOf']) {
          const balanceResult = await methods['balanceOf'](address);
          if (mountedRef.current && balanceResult && !balanceResult.revert) {
            const decoded = balanceResult.properties as Record<string, bigint>;
            setBalance(decoded['balance'] ?? 0n);
          }
        }

        if (methods['totalSupply']) {
          const supplyResult = await methods['totalSupply']();
          if (mountedRef.current && supplyResult && !supplyResult.revert) {
            const decoded = supplyResult.properties as Record<string, bigint>;
            setTotalSupply(decoded['totalSupply'] ?? 0n);
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
  }, [eggContract, address, blockHeight]);

  const increaseAllowance = useCallback(
    async (spender: string, amount: bigint): Promise<TransactionState> => {
      if (!eggContract || !address) {
        return { status: 'error', error: 'Wallet not connected or contract not loaded' };
      }

      const methods = eggContract as unknown as ContractMethods;
      const approveMethod = methods['approve'];

      if (!approveMethod) {
        return { status: 'error', error: 'Approve method not found on contract' };
      }

      try {
        const simulationResult = await approveMethod(spender, amount);

        if (simulationResult.revert) {
          return { status: 'error', error: simulationResult.revert.toString() };
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

        return { status: 'confirmed', txId: result.transactionId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Allowance transaction failed';
        return { status: 'error', error: message };
      }
    },
    [eggContract, address, network],
  );

  return { balance, totalSupply, increaseAllowance, isLoading };
}
