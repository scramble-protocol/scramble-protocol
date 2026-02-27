import React, { useState, useCallback } from 'react';
import type { StakingPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useEggStaking, useEggToken, useWallet } from '../hooks/index.js';
import { Card, Button, Input, Spinner, CookingProgress, OnThePan, type CookingStep } from '../components/common/index.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/8bit/tabs.js';
import { FormatService } from '../services/FormatService.js';

const STAKING_STEPS: readonly CookingStep[] = [
  { id: 'approving', label: 'Seasoning', description: 'Seasoning the pan... Confirm approval in your wallet.' },
  { id: 'confirming', label: 'Baking', description: 'Waiting for approval to bake into a Bitcoin block...' },
  { id: 'simulating', label: 'Preheating', description: 'Checking the temperature...' },
  { id: 'signing', label: 'Cracking', description: 'Crack that egg! Confirm in your wallet.' },
  { id: 'broadcasting', label: 'Scrambling', description: 'Your eggs are scrambling...' },
  { id: 'confirmed', label: 'Scrambled', description: '$EGG staked. MOTO rewards incoming!' },
];

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

function StakeUnstakeTabs({
  eggBalance,
  position,
  onStake,
  onUnstake,
  isLoading,
}: {
  readonly eggBalance: bigint;
  readonly position: StakingPosition | null;
  readonly onStake: (amount: bigint) => void;
  readonly onUnstake: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');

  const handleStake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(stakeAmount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onStake(parsed);
      setStakeAmount('');
    }
  }, [stakeAmount, onStake]);

  const handleUnstake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(unstakeAmount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onUnstake(parsed);
      setUnstakeAmount('');
    }
  }, [unstakeAmount, onUnstake]);

  const handleStakeMax = useCallback((): void => {
    setStakeAmount(FormatService.formatTokenAmount(eggBalance, TOKEN_DECIMALS));
  }, [eggBalance]);

  const handleUnstakeMax = useCallback((): void => {
    if (position !== null) {
      setUnstakeAmount(FormatService.formatTokenAmount(position.staked, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card>
      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
        </TabsList>

        <TabsContent value="stake">
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-xs text-muted-foreground">
              Stake $EGG to earn 5% of all Spatula harvests. Rewards are paid in MOTO.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-medium text-foreground">
                {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 4)} EGG
              </span>
            </div>
            <Input
              label="Amount to Stake"
              value={stakeAmount}
              onChange={setStakeAmount}
              placeholder="0.00"
              suffix="EGG"
              maxButton
              onMax={handleStakeMax}
              type="text"
            />
            <Button
              onClick={handleStake}
              disabled={isLoading || stakeAmount === ''}
              loading={isLoading}
              fullWidth
            >
              Stake
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="unstake">
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-xs text-muted-foreground">
              Unstake anytime — no lock-up period.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Currently Staked</span>
              <span className="font-medium text-foreground">
                {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} EGG
              </span>
            </div>
            <Input
              label="Amount to Unstake"
              value={unstakeAmount}
              onChange={setUnstakeAmount}
              placeholder="0.00"
              suffix="EGG"
              maxButton
              onMax={handleUnstakeMax}
              type="text"
            />
            <Button
              onClick={handleUnstake}
              disabled={isLoading || unstakeAmount === ''}
              loading={isLoading}
              variant="secondary"
              fullWidth
            >
              Unstake
            </Button>
          </div>
        </TabsContent>
      </Tabs>
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
        <div className="mx-auto w-full max-w-lg flex flex-col gap-6">
          <StakeUnstakeTabs
            eggBalance={egg.balance}
            position={staking.position}
            onStake={handleStake}
            onUnstake={handleUnstake}
            isLoading={staking.isLoading}
          />
          <StakingRewards
            pendingRewards={staking.position?.pendingRewards ?? 0n}
            onClaim={handleClaimRewards}
            isLoading={staking.isLoading}
          />
        </div>
        <CookingProgress
          status={staking.txState.status}
          txId={staking.txState.txId}
          error={staking.txState.error}
          message={staking.txState.message}
          steps={STAKING_STEPS}
          successMessage="Your $EGG is staked. MOTO rewards are cooking!"
        />
        <OnThePan txState={staking.txState} />
      </div>
    </PageLayout>
  );
}

export { StakePage };
