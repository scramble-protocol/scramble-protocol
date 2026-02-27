import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, VaultPosition, VaultStats } from '../types/index.js';
import type { CallResult } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { THE_PAN_ABI } from '../abi/index.js';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useCustomContract, useOP20Contract } from './useContract.js';
import { useOPNetProvider } from './useOPNetProvider.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_THE_PAN } from '../config/demoData.js';

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
  const { address, opnetAddress } = useWallet();
  const { blockHeight } = useBlockHeight();
  const { provider } = useOPNetProvider();
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
    if (isDemoMode()) return;
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
        // Position data
        if (opnetAddress) {
          const promises: Promise<CallResult>[] = [];

          if (methods['pendingSizzle']) {
            promises.push(methods['pendingSizzle'](opnetAddress));
          }
          if (methods['balanceOf']) {
            promises.push(methods['balanceOf'](opnetAddress));
          }

          const results = await Promise.all(promises);
          const [sizzleResult, balanceResult] = results;

          if (mountedRef.current) {
            const pendingSizzle = sizzleResult && !sizzleResult.revert
              ? (sizzleResult.properties as Record<string, bigint>)['pending'] ?? 0n
              : 0n;
            const shells = balanceResult && !balanceResult.revert
              ? (balanceResult.properties as Record<string, bigint>)['balance'] ?? 0n
              : 0n;

            setPosition({
              shells,
              eggBoost: 0n,
              depositBlock: 0n,
              cookLevel: 0,
              pendingSizzle,
            });
          }
        }

        // Stats: totalSupply + MOTO balance of Pan = butter reserve
        const statsPromises: Promise<unknown>[] = [];
        if (methods['totalSupply']) {
          statsPromises.push(methods['totalSupply']());
        }
        if (motoContract) {
          const motoMethods = motoContract as unknown as ContractMethods;
          if (motoMethods['balanceOf']) {
            statsPromises.push(
              motoMethods['balanceOf'](Address.fromString(contracts.thePan)),
            );
          }
        }

        const [tsResult, motoBalResult] = await Promise.all(statsPromises) as [
          { properties: Record<string, bigint>; revert?: unknown } | undefined,
          { properties: Record<string, bigint>; revert?: unknown } | undefined,
        ];

        if (mountedRef.current && tsResult && !tsResult.revert) {
          const totalShells = tsResult.properties['totalSupply'] ?? 0n;
          const butterReserve = (motoBalResult && !motoBalResult.revert)
            ? motoBalResult.properties['balance'] ?? 0n
            : 0n;

          setStats({
            tvl: butterReserve,
            totalShells,
            butterLevel: butterReserve,
            sizzleRate: 0n,
          });
        }
      } catch (err) {
        console.error('[ThePan] fetchData error:', err);
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    void fetchData();

    return (): void => {
      mountedRef.current = false;
    };
  }, [panContract, motoContract, opnetAddress, blockHeight, contracts.thePan]);

  const simulateAndSend = useCallback(
    async (methodName: string, args: unknown[], stepPrefix: string, successMsg: string): Promise<TransactionState> => {
      if (!panContract || !address) {
        return { status: 'error', error: 'Wallet not connected or contract not loaded' };
      }

      const methods = panContract as unknown as ContractMethods;
      const method = methods[methodName];

      if (!method) {
        return { status: 'error', error: `Method ${methodName} not found on contract` };
      }

      try {
        setTxState({
          status: 'simulating',
          message: `${stepPrefix} — Warming the pan...`,
        });

        const simulationResult = await method(...args);

        if (simulationResult.revert) {
          const errorState: TransactionState = {
            status: 'error',
            error: simulationResult.revert.toString(),
          };
          setTxState(errorState);
          return errorState;
        }

        setTxState({
          status: 'signing',
          message: `${stepPrefix} — Flip that egg! Confirm in your wallet.`,
        });
        const networkConfig = getNetworkConfig(network);

        const result = await simulationResult.sendTransaction({
          signer: null,
          mldsaSigner: null,
          linkMLDSAPublicKeyToAddress: false,
          refundTo: address,
          maximumAllowedSatToSpend: 1_000_000n,
          feeRate: 1,
          priorityFee: 50_000n,
          network: networkConfig.network,
        });

        setTxState({ status: 'broadcasting', message: `${stepPrefix} — Sizzling on the pan...` });
        const confirmedState: TransactionState = {
          status: 'confirmed',
          txId: result.transactionId,
          message: successMsg,
        };
        setTxState(confirmedState);
        return confirmedState;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        console.error(`[ThePan] ${methodName} error:`, message);
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [panContract, address, network],
  );

  const checkMotoAllowance = useCallback(
    async (): Promise<bigint> => {
      if (!motoContract || !opnetAddress) return 0n;
      try {
        const methods = motoContract as unknown as ContractMethods;
        const fn = methods['allowance'];
        if (!fn) return 0n;
        const spender = Address.fromString(contracts.thePan);
        const result = await fn(opnetAddress, spender);
        if (result && !result.revert) {
          return (result.properties as Record<string, bigint>)['remaining'] ?? 0n;
        }
      } catch (err) {
        console.warn('[ThePan] MOTO allowance check failed:', err);
      }
      return 0n;
    },
    [motoContract, opnetAddress, contracts.thePan],
  );

  const checkEggAllowance = useCallback(
    async (): Promise<bigint> => {
      if (!eggContract || !opnetAddress) return 0n;
      try {
        const methods = eggContract as unknown as ContractMethods;
        const fn = methods['allowance'];
        if (!fn) return 0n;
        const spender = Address.fromString(contracts.thePan);
        const result = await fn(opnetAddress, spender);
        if (result && !result.revert) {
          return (result.properties as Record<string, bigint>)['remaining'] ?? 0n;
        }
      } catch (err) {
        console.warn('[ThePan] EGG allowance check failed:', err);
      }
      return 0n;
    },
    [eggContract, opnetAddress, contracts.thePan],
  );

  const approveToken = useCallback(
    async (
      tokenContract: unknown,
      spender: string,
      amount: bigint,
      tokenName: string,
    ): Promise<TransactionState> => {
      if (!address || !tokenContract) {
        return { status: 'error', error: 'Wallet not connected or token contract not loaded' };
      }

      try {
        setTxState({
          status: 'approving',
          message: `Step 1 of 3 — Greasing the pan with ${tokenName}... Confirm in your wallet.`,
        });
        const methods = tokenContract as ContractMethods;
        const allowanceMethod = methods['increaseAllowance'];

        if (!allowanceMethod) {
          return { status: 'error', error: 'increaseAllowance method not found on token contract' };
        }

        const simulationResult = await allowanceMethod(Address.fromString(spender), amount);

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
          linkMLDSAPublicKeyToAddress: false,
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

  const waitAndRetry = useCallback(
    async (
      tokenName: string,
      checkAllowance: () => Promise<bigint>,
      neededAmount: bigint,
      methodName: string,
      args: unknown[],
      successMsg: string,
    ): Promise<TransactionState> => {
      const MAX_BLOCK_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_BLOCK_RETRIES; attempt++) {
        setTxState({
          status: 'confirming',
          message: `Step 2 of 3 — Waiting for the ${tokenName} approval to bake into a Bitcoin block. ~10 min. (attempt ${String(attempt + 1)}/${String(MAX_BLOCK_RETRIES)})`,
        });
        try {
          const blockBefore = BigInt(await provider.getBlockNumber());
          console.log(`[ThePan] retry #${String(attempt + 1)} — waiting for block > ${blockBefore.toString()}`);
          const maxWaitMs = 660_000;
          const startTime = Date.now();
          while (Date.now() - startTime < maxWaitMs) {
            if (!mountedRef.current) {
              return { status: 'error', error: 'Cancelled' };
            }
            await new Promise(resolve => setTimeout(resolve, 5_000));
            const blockNow = BigInt(await provider.getBlockNumber());
            if (blockNow > blockBefore) {
              console.log(`[ThePan] new block: ${blockNow.toString()}`);
              break;
            }
          }
        } catch (pollErr) {
          console.warn('[ThePan] block polling error:', pollErr);
        }

        const currentAllowance = await checkAllowance();
        console.log(`[ThePan] retry #${String(attempt + 1)} — allowance: ${currentAllowance.toString()}, need: ${neededAmount.toString()}`);

        if (currentAllowance < neededAmount) {
          continue;
        }

        try {
          const result = await simulateAndSend(methodName, args, 'Step 3 of 3', successMsg);
          if (result.status === 'error') {
            const errMsg = result.error ?? '';
            if (errMsg.toLowerCase().includes('allowance')) {
              continue;
            }
            return result;
          }
          return result;
        } catch (retryErr: unknown) {
          const retryMsg = retryErr instanceof Error ? retryErr.message : '';
          if (!retryMsg.toLowerCase().includes('allowance')) {
            const errorState: TransactionState = { status: 'error', error: retryMsg || 'Transaction failed' };
            setTxState(errorState);
            return errorState;
          }
        }
      }

      const errorState: TransactionState = {
        status: 'error',
        error: `${tokenName} approval not confirmed after 3 blocks. Please try again.`,
      };
      setTxState(errorState);
      return errorState;
    },
    [provider, simulateAndSend],
  );

  const deposit = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!motoContract || !opnetAddress || !address) {
        return { status: 'error', error: 'Contracts not loaded' };
      }

      // Optimistic: try deposit directly (works if allowance already exists)
      console.log('[ThePan] deposit — optimistic attempt with amount:', amount.toString());
      try {
        const optimisticResult = await simulateAndSend('deposit', [amount], 'Step 1 of 1', 'MOTO deposited. Shell tokens served!');
        if (optimisticResult.status === 'error') {
          const errMsg = optimisticResult.error ?? '';
          console.log('[ThePan] deposit — optimistic returned error:', errMsg);
          if (!errMsg.toLowerCase().includes('allowance')) {
            return optimisticResult;
          }
        } else {
          return optimisticResult;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        console.log('[ThePan] deposit — optimistic threw:', msg);
        if (!msg.toLowerCase().includes('allowance')) {
          const errorState: TransactionState = { status: 'error', error: msg || 'Deposit failed' };
          setTxState(errorState);
          return errorState;
        }
      }

      // Allowance insufficient — check how much we need, approve, wait, retry
      const currentAllowance = await checkMotoAllowance();
      const increaseBy = amount - (currentAllowance > 0n ? currentAllowance : 0n);
      console.log('[ThePan] deposit — need to increase MOTO allowance by:', increaseBy.toString());

      const approvalResult = await approveToken(motoContract, contracts.thePan, increaseBy > 0n ? increaseBy : amount, 'MOTO');
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return waitAndRetry('MOTO', checkMotoAllowance, amount, 'deposit', [amount], 'MOTO deposited. Shell tokens served!');
    },
    [motoContract, opnetAddress, address, contracts.thePan, simulateAndSend, approveToken, checkMotoAllowance, waitAndRetry],
  );

  const withdraw = useCallback(
    async (shares: bigint): Promise<TransactionState> => {
      return simulateAndSend('withdraw', [shares], 'Step 1 of 1', 'MOTO withdrawn. Shell tokens returned.');
    },
    [simulateAndSend],
  );

  const claimSizzle = useCallback(async (): Promise<TransactionState> => {
    return simulateAndSend('claimSizzle', [], 'Step 1 of 1', 'Sizzle rewards claimed!');
  }, [simulateAndSend]);

  const depositEggBoost = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!eggContract || !opnetAddress || !address) {
        return { status: 'error', error: 'Contracts not loaded' };
      }

      // Optimistic: try directly
      console.log('[ThePan] depositEggBoost — optimistic attempt with amount:', amount.toString());
      try {
        const optimisticResult = await simulateAndSend('depositEggBoost', [amount], 'Step 1 of 1', '$EGG boost activated! +0.25x Cook Level bonus.');
        if (optimisticResult.status === 'error') {
          const errMsg = optimisticResult.error ?? '';
          if (!errMsg.toLowerCase().includes('allowance')) {
            return optimisticResult;
          }
        } else {
          return optimisticResult;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        if (!msg.toLowerCase().includes('allowance')) {
          const errorState: TransactionState = { status: 'error', error: msg || 'EGG Boost failed' };
          setTxState(errorState);
          return errorState;
        }
      }

      // Allowance insufficient — approve, wait, retry
      const currentAllowance = await checkEggAllowance();
      const increaseBy = amount - (currentAllowance > 0n ? currentAllowance : 0n);

      const approvalResult = await approveToken(eggContract, contracts.thePan, increaseBy > 0n ? increaseBy : amount, 'EGG');
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      return waitAndRetry('EGG', checkEggAllowance, amount, 'depositEggBoost', [amount], '$EGG boost activated! +0.25x Cook Level bonus.');
    },
    [eggContract, opnetAddress, address, contracts.thePan, simulateAndSend, approveToken, checkEggAllowance, waitAndRetry],
  );

  const withdrawEggBoost = useCallback(async (): Promise<TransactionState> => {
    return simulateAndSend('withdrawEggBoost', [], 'Step 1 of 1', '$EGG boost removed.');
  }, [simulateAndSend]);

  if (isDemoMode()) return DEMO_THE_PAN;

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
