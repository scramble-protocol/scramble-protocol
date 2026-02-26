import React, { useState, useCallback } from 'react';
import type { StakingPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useEggStaking, useEggToken, useWallet } from '../hooks/index.js';
import { Card, Button, Input, Spinner, TransactionStatus, OnThePan } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

const TOKEN_DECIMALS = 18;

function StakingStats({
  position,
  eggBalance,
  isLoading,
}: {
  readonly position: StakingPosition | null;
  readonly eggBalance: bigint;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[
        { label: 'Your $EGG Balance', value: `${FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 2)} EGG` },
        { label: 'Staked', value: `${FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 2)} EGG` },
        { label: 'Pending MOTO Rewards', value: `${FormatService.formatBigIntWithDecimals(position?.pendingRewards ?? 0n, TOKEN_DECIMALS, 4)} MOTO`, highlight: true },
      ].map((item) => (
        <div key={item.label} className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          {isLoading ? (
            <div className="mt-2 h-5 w-24 animate-shimmer rounded" />
          ) : (
            <p className={`mt-1 text-sm font-semibold ${item.highlight === true ? 'text-sizzle' : 'text-foreground'}`}>
              {item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function StakeForm({
  eggBalance,
  onStake,
  isLoading,
}: {
  readonly eggBalance: bigint;
  readonly onStake: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState<string>('');

  const handleStake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(amount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onStake(parsed);
      setAmount('');
    }
  }, [amount, onStake]);

  const handleMax = useCallback((): void => {
    setAmount(FormatService.formatTokenAmount(eggBalance, TOKEN_DECIMALS));
  }, [eggBalance]);

  return (
    <Card title="Stake $EGG" subtitle="Stake $EGG to earn 5% of all Spatula harvests. Rewards are paid in MOTO.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available</span>
          <span className="font-medium text-foreground">
            {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <Input
          label="Amount to Stake"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="EGG"
          maxButton
          onMax={handleMax}
          type="text"
        />
        <Button
          onClick={handleStake}
          disabled={isLoading || amount === ''}
          loading={isLoading}
          fullWidth
        >
          Stake
        </Button>
      </div>
    </Card>
  );
}

function UnstakeForm({
  position,
  onUnstake,
  isLoading,
}: {
  readonly position: StakingPosition | null;
  readonly onUnstake: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState<string>('');

  const handleUnstake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(amount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onUnstake(parsed);
      setAmount('');
    }
  }, [amount, onUnstake]);

  const handleMax = useCallback((): void => {
    if (position !== null) {
      setAmount(FormatService.formatTokenAmount(position.staked, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card title="Unstake" subtitle="Unstake anytime — no lock-up period">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Currently Staked</span>
          <span className="font-medium text-foreground">
            {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <Input
          label="Amount to Unstake"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="EGG"
          maxButton
          onMax={handleMax}
          type="text"
        />
        <Button
          onClick={handleUnstake}
          disabled={isLoading || amount === ''}
          loading={isLoading}
          variant="secondary"
          fullWidth
        >
          Unstake
        </Button>
      </div>
    </Card>
  );
}

function StakingRewards({
  pendingRewards,
  onClaim,
  isLoading,
}: {
  readonly pendingRewards: bigint;
  readonly onClaim: () => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <Card title="Staking Rewards" glow="sizzle">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pending MOTO Rewards</span>
          <span className="font-semibold text-sizzle">
            {FormatService.formatBigIntWithDecimals(pendingRewards, TOKEN_DECIMALS, 4)} MOTO
          </span>
        </div>
        <Button
          onClick={onClaim}
          disabled={isLoading || pendingRewards === 0n}
          loading={isLoading}
          fullWidth
        >
          Claim Rewards
        </Button>
      </div>
    </Card>
  );
}

function StakePage(): React.ReactElement {
  const staking = useEggStaking();
  const egg = useEggToken();
  const { isConnected, openConnectModal } = useWallet();

  const handleStake = useCallback(
    (amount: bigint): void => {
      void staking.stake(amount);
    },
    [staking],
  );

  const handleUnstake = useCallback(
    (amount: bigint): void => {
      void staking.unstake(amount);
    },
    [staking],
  );

  const handleClaimRewards = useCallback((): void => {
    void staking.claimRewards();
  }, [staking]);

  if (!isConnected) {
    return (
      <PageLayout title="Stake $EGG">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="Stake $EGG">
              <p className="mb-4 text-sm text-muted-foreground">
                Stake $EGG to earn 5% of all Spatula harvests. Rewards are paid in MOTO — real yield from real protocol activity.
              </p>
              <Button onClick={openConnectModal} fullWidth>
                Connect Wallet
              </Button>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (staking.isLoading && staking.position === null) {
    return (
      <PageLayout title="Stake $EGG">
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Stake $EGG">
      <div className="flex flex-col gap-6">
        <StakingStats
          position={staking.position}
          eggBalance={egg.balance}
          isLoading={staking.isLoading || egg.isLoading}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <StakeForm
              eggBalance={egg.balance}
              onStake={handleStake}
              isLoading={staking.isLoading}
            />
            <UnstakeForm
              position={staking.position}
              onUnstake={handleUnstake}
              isLoading={staking.isLoading}
            />
          </div>
          <div className="flex flex-col gap-6">
            <StakingRewards
              pendingRewards={staking.position?.pendingRewards ?? 0n}
              onClaim={handleClaimRewards}
              isLoading={staking.isLoading}
            />
          </div>
        </div>
        <TransactionStatus state={staking.txState} />
        <OnThePan txState={staking.txState} />
      </div>
    </PageLayout>
  );
}

export { StakePage };
