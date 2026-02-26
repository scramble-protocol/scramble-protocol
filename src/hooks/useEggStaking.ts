import { useState, useEffect, useCallback, useRef } from 'react';
import type { TransactionState, StakingPosition } from '../types/index.js';
import type { CallResult } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { getContracts } from '../config/contracts.js';
import { getNetworkConfig } from '../config/networks.js';
import { useOP20Contract } from './useContract.js';
import { useOPNetProvider } from './useOPNetProvider.js';
import { useWallet } from './useWallet.js';
import { useBlockHeight } from './useBlockHeight.js';
import { useNetwork } from './useNetwork.js';
import { isDemoMode } from '../config/demoMode.js';
import { DEMO_EGG_STAKING } from '../config/demoData.js';
import { callView, callWrite, BinaryWriter } from '../services/RawContractService.js';

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
  const { address, opnetAddress } = useWallet();
  const { blockHeight } = useBlockHeight();
  const { provider } = useOPNetProvider();
  const contracts = getContracts(network);

  const eggContract = useOP20Contract(contracts.eggToken);

  const [position, setPosition] = useState<StakingPosition | null>(null);
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
        console.log('[EggStaking] fetching stakedBalance + pendingReward for', opnetAddress.toString());
        const [stakedResult, pendingResult] = await Promise.all([
          callView(
            provider,
            contracts.eggStaking,
            opnetAddress,
            'stakedBalance',
            (w: BinaryWriter) => w.writeAddress(opnetAddress),
          ),
          callView(
            provider,
            contracts.eggStaking,
            opnetAddress,
            'pendingReward',
            (w: BinaryWriter) => w.writeAddress(opnetAddress),
          ),
        ]);

        if (mountedRef.current) {
          const staked = stakedResult.result?.readU256() ?? 0n;
          const pendingRewards = pendingResult.result?.readU256() ?? 0n;
          console.log('[EggStaking] staked:', staked.toString(), 'pendingRewards:', pendingRewards.toString());
          setPosition({ staked, pendingRewards });
        }
      } catch (err) {
        console.error('[EggStaking] fetchData error:', err);
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    void fetchData();

    return (): void => {
      mountedRef.current = false;
    };
  }, [provider, contracts.eggStaking, opnetAddress, blockHeight]);

  const checkAllowance = useCallback(
    async (): Promise<bigint> => {
      if (!eggContract || !opnetAddress) return 0n;
      try {
        const methods = eggContract as unknown as ContractMethods;
        const fn = methods['allowance'];
        if (!fn) return 0n;
        const spender = Address.fromString(contracts.eggStaking);
        const result = await fn(opnetAddress, spender);
        if (result && !result.revert) {
          const remaining = (result.properties as Record<string, bigint>)['remaining'] ?? 0n;
          console.log('[EggStaking] on-chain allowance remaining:', remaining.toString());
          return remaining;
        }
      } catch (err) {
        console.warn('[EggStaking] allowance check failed:', err);
      }
      return 0n;
    },
    [eggContract, opnetAddress, contracts.eggStaking],
  );

  const approveEgg = useCallback(
    async (stakeAmount: bigint): Promise<TransactionState> => {
      if (!eggContract || !address || !opnetAddress) {
        return { status: 'error', error: 'Wallet not connected or EGG contract not loaded' };
      }

      try {
        setTxState({
          status: 'approving',
          message: 'Step 1 of 3 — Signing the permission slip so the chef can use your eggs.',
        });
        const methods = eggContract as unknown as ContractMethods;
        const spender = Address.fromString(contracts.eggStaking);

        // Check current allowance to only increase by the needed amount
        // (increaseAllowance is additive — calling with MAX would overflow)
        const currentAllowance = await checkAllowance();
        console.log('[EggStaking] approveEgg — stakeAmount:', stakeAmount.toString(), 'currentAllowance:', currentAllowance.toString());

        if (currentAllowance >= stakeAmount) {
          console.log('[EggStaking] approveEgg — already have enough allowance, skipping');
          return { status: 'confirmed' };
        }

        const increaseBy = stakeAmount - currentAllowance;
        console.log('[EggStaking] approveEgg — increaseBy:', increaseBy.toString());

        const allowanceMethod = methods['increaseAllowance'];
        if (!allowanceMethod) {
          return { status: 'error', error: 'increaseAllowance method not found on EGG contract' };
        }

        const simulationResult = await allowanceMethod(spender, increaseBy);
        console.log('[EggStaking] approveEgg — simulation revert?', simulationResult.revert?.toString() ?? 'none');

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

        console.log('[EggStaking] approveEgg — txId:', result.transactionId ?? 'NONE');

        if (!result.transactionId) {
          return { status: 'error', error: 'Approval transaction failed — no txId returned' };
        }

        return { status: 'confirmed', txId: result.transactionId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'EGG approval failed';
        console.error('[EggStaking] approveEgg — error:', message);
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [eggContract, address, opnetAddress, contracts.eggStaking, network, checkAllowance],
  );

  const simulateAndSendStake = useCallback(
    async (amount: bigint, afterApproval: boolean): Promise<TransactionState> => {
      if (!address || !opnetAddress) {
        return { status: 'error', error: 'Wallet not connected' };
      }

      const step = afterApproval ? 'Step 3 of 3' : 'Step 1 of 1';

      setTxState({
        status: 'simulating',
        message: `${step} — Checking if the kitchen can cook your eggs.`,
      });
      const networkConfig = getNetworkConfig(network);

      const callResult = await callWrite(
        provider,
        contracts.eggStaking,
        opnetAddress,
        networkConfig.network,
        'stake',
        (w: BinaryWriter) => w.writeU256(amount),
      );

      if (callResult.revert) {
        const errorState: TransactionState = {
          status: 'error',
          error: callResult.revert.toString(),
        };
        setTxState(errorState);
        return errorState;
      }

      setTxState({
        status: 'signing',
        message: `${step} — Putting eggs on the stove. Confirm in your wallet.`,
      });

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

      setTxState({ status: 'broadcasting', message: `${step} — Eggs are sizzling...` });
      const confirmedState: TransactionState = {
        status: 'confirmed',
        txId: result.transactionId,
        message: 'Your eggs are on the stove. MOTO rewards are now cooking.',
      };
      setTxState(confirmedState);
      return confirmedState;
    },
    [address, opnetAddress, provider, contracts.eggStaking, network],
  );

  const stake = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!address || !opnetAddress) {
        return { status: 'error', error: 'Wallet not connected' };
      }

      // Debug: check wallet MLDSA status
      console.log('[EggStaking] wallet address:', address);
      console.log('[EggStaking] opnetAddress:', opnetAddress?.toString());
      try {
        const w = window as unknown as Record<string, unknown>;
        const opnetObj = w['opnet'] as Record<string, unknown> | undefined;
        if (opnetObj?.['web3']) {
          const web3 = opnetObj['web3'] as Record<string, (...args: unknown[]) => Promise<unknown>>;
          const mldsaKey = await web3['getMLDSAPublicKey']();
          console.log('[EggStaking] wallet MLDSA public key:', mldsaKey);
          const hashedKey = await web3['getHashedMLDSAKey']?.();
          console.log('[EggStaking] wallet hashed MLDSA key:', hashedKey);
        } else {
          console.log('[EggStaking] window.opnet.web3 not found');
        }
      } catch (e) {
        console.warn('[EggStaking] MLDSA key check failed:', e);
      }

      // Optimistic: try to stake directly (works if allowance already exists)
      console.log('[EggStaking] stake — optimistic attempt with amount:', amount.toString());
      try {
        const optimisticResult = await simulateAndSendStake(amount, false);
        // Check if it returned an error (revert path) vs threw
        if (optimisticResult.status === 'error') {
          const errMsg = optimisticResult.error ?? '';
          console.log('[EggStaking] stake — optimistic returned error:', errMsg);
          if (!errMsg.toLowerCase().includes('allowance')) {
            return optimisticResult;
          }
          // Fall through to approval flow
        } else {
          return optimisticResult;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        console.log('[EggStaking] stake — optimistic threw:', msg);
        if (!msg.toLowerCase().includes('allowance')) {
          // Not an allowance issue — real error
          const errorState: TransactionState = { status: 'error', error: msg || 'Stake failed' };
          setTxState(errorState);
          return errorState;
        }
      }

      // Allowance insufficient — approve then wait for confirmation then retry
      const approvalResult = await approveEgg(amount);
      if (approvalResult.status === 'error') {
        return approvalResult;
      }

      // Retry stake across up to 5 blocks until the approval lands
      const MAX_BLOCK_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_BLOCK_RETRIES; attempt++) {
        // Wait for next block
        setTxState({
          status: 'confirming',
          message: `Step 2 of 3 — Baking the permission slip into a Bitcoin block. This takes ~10 min. (attempt ${String(attempt + 1)}/${String(MAX_BLOCK_RETRIES)})`,
        });
        try {
          const blockBefore = BigInt(await provider.getBlockNumber());
          console.log(`[EggStaking] retry #${String(attempt + 1)} — waiting for block > ${blockBefore.toString()}`);
          const maxWaitMs = 660_000;
          const startTime = Date.now();
          while (Date.now() - startTime < maxWaitMs) {
            if (!mountedRef.current) {
              return { status: 'error', error: 'Cancelled' };
            }
            await new Promise(resolve => setTimeout(resolve, 5_000));
            const blockNow = BigInt(await provider.getBlockNumber());
            if (blockNow > blockBefore) {
              console.log(`[EggStaking] new block: ${blockNow.toString()}`);
              break;
            }
          }
        } catch (pollErr) {
          console.warn('[EggStaking] block polling error:', pollErr);
        }

        // Check allowance before attempting stake
        const currentAllowance = await checkAllowance();
        console.log(`[EggStaking] retry #${String(attempt + 1)} — allowance: ${currentAllowance.toString()}, need: ${amount.toString()}`);

        if (currentAllowance < amount) {
          console.log(`[EggStaking] retry #${String(attempt + 1)} — allowance still insufficient, waiting for next block`);
          continue;
        }

        // Allowance is enough — try stake
        try {
          const result = await simulateAndSendStake(amount, true);
          // simulateAndSendStake may return an error state instead of throwing
          if (result.status === 'error') {
            const errMsg = result.error ?? '';
            console.log(`[EggStaking] retry #${String(attempt + 1)} — stake returned error: ${errMsg}`);
            if (errMsg.toLowerCase().includes('allowance')) {
              continue; // still an allowance issue, keep retrying
            }
            return result; // different error, stop
          }
          return result;
        } catch (retryErr: unknown) {
          const retryMsg = retryErr instanceof Error ? retryErr.message : '';
          console.log(`[EggStaking] retry #${String(attempt + 1)} — stake threw: ${retryMsg}`);
          if (!retryMsg.toLowerCase().includes('allowance')) {
            const errorState: TransactionState = { status: 'error', error: retryMsg || 'Stake failed' };
            setTxState(errorState);
            return errorState;
          }
          // Still waiting for allowance — loop and wait for next block
        }
      }

      const errorState: TransactionState = {
        status: 'error',
        error: 'Approval not confirmed after 3 blocks. Please try staking again.',
      };
      setTxState(errorState);
      return errorState;
    },
    [simulateAndSendStake, approveEgg, checkAllowance, address, opnetAddress, provider],
  );

  const unstake = useCallback(
    async (amount: bigint): Promise<TransactionState> => {
      if (!address || !opnetAddress) {
        return { status: 'error', error: 'Wallet not connected' };
      }

      try {
        setTxState({ status: 'simulating' });
        const networkConfig = getNetworkConfig(network);

        const callResult = await callWrite(
          provider,
          contracts.eggStaking,
          opnetAddress,
          networkConfig.network,
          'unstake',
          (w: BinaryWriter) => w.writeU256(amount),
        );

        if (callResult.revert) {
          const errorState: TransactionState = {
            status: 'error',
            error: callResult.revert.toString(),
          };
          setTxState(errorState);
          return errorState;
        }

        setTxState({ status: 'signing' });

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

        setTxState({ status: 'broadcasting' });
        const confirmedState: TransactionState = {
          status: 'confirmed',
          txId: result.transactionId,
        };
        setTxState(confirmedState);
        return confirmedState;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unstake transaction failed';
        const errorState: TransactionState = { status: 'error', error: message };
        setTxState(errorState);
        return errorState;
      }
    },
    [address, opnetAddress, provider, contracts.eggStaking, network],
  );

  const claimRewards = useCallback(async (): Promise<TransactionState> => {
    if (!address || !opnetAddress) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      setTxState({ status: 'simulating' });
      const networkConfig = getNetworkConfig(network);

      const callResult = await callWrite(
        provider,
        contracts.eggStaking,
        opnetAddress,
        networkConfig.network,
        'claimReward',
      );

      if (callResult.revert) {
        const errorState: TransactionState = {
          status: 'error',
          error: callResult.revert.toString(),
        };
        setTxState(errorState);
        return errorState;
      }

      setTxState({ status: 'signing' });

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

      setTxState({ status: 'broadcasting' });
      const confirmedState: TransactionState = {
        status: 'confirmed',
        txId: result.transactionId,
      };
      setTxState(confirmedState);
      return confirmedState;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Claim rewards failed';
      const errorState: TransactionState = { status: 'error', error: message };
      setTxState(errorState);
      return errorState;
    }
  }, [address, opnetAddress, provider, contracts.eggStaking, network]);

  if (isDemoMode()) return DEMO_EGG_STAKING;

  return { position, stake, unstake, claimRewards, isLoading, txState };
}
