import React, { useState, useCallback } from 'react';
import type { FarmPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useLPMining, useWallet, useBlockHeight } from '../hooks/index.js';
import { Card, Button, Input, Spinner, CookingProgress, OnThePan, type CookingStep } from '../components/common/index.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/8bit/tabs.js';
import { FormatService } from '../services/FormatService.js';

const FARM_STEPS: readonly CookingStep[] = [
  { id: 'approving', label: 'Measuring', description: 'Measuring ingredients... Confirm approval in your wallet.' },
  { id: 'confirming', label: 'Resting', description: 'Waiting for approval to bake into a Bitcoin block...' },
  { id: 'simulating', label: 'Prepping', description: 'Checking the pantry...' },
  { id: 'signing', label: 'Mixing', description: 'Mix it up! Confirm in your wallet.' },
  { id: 'broadcasting', label: 'Baking', description: 'Your LP tokens are in the oven!' },
  { id: 'confirmed', label: 'Ready', description: 'LP tokens staked. $EGG rewards cooking!' },
];

const TOKEN_DECIMALS = 18;

function EmissionChart({
  position,
  blockHeight,
  isLoading,
}: {
  readonly position: FarmPosition | null;
  readonly blockHeight: bigint;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <Card title="$EGG-MOTO LP Mining Emissions">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Current Block', value: blockHeight.toString() },
          { label: 'Your $EGG-MOTO LP Staked', value: `${FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} LP` },
          { label: 'Pending $EGG', value: `${FormatService.formatBigIntWithDecimals(position?.pendingEgg ?? 0n, TOKEN_DECIMALS, 4)} EGG`, highlight: true },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            {isLoading ? (
              <div className="h-5 w-24 animate-shimmer rounded" />
            ) : (
              <span className={`text-sm font-semibold ${item.highlight === true ? 'text-egg' : 'text-foreground'}`}>
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function StakeUnstakeTabs({
  position,
  onStakeLP,
  onUnstakeLP,
  isLoading,
}: {
  readonly position: FarmPosition | null;
  readonly onStakeLP: (amount: bigint) => void;
  readonly onUnstakeLP: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');

  const handleStake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(stakeAmount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onStakeLP(parsed);
      setStakeAmount('');
    }
  }, [stakeAmount, onStakeLP]);

  const handleUnstake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(unstakeAmount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onUnstakeLP(parsed);
      setUnstakeAmount('');
    }
  }, [unstakeAmount, onUnstakeLP]);

  const handleUnstakeMax = useCallback((): void => {
    if (position !== null) {
      setUnstakeAmount(FormatService.formatTokenAmount(position.staked, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card>
      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stake">Stake LP</TabsTrigger>
          <TabsTrigger value="unstake">Unstake LP</TabsTrigger>
        </TabsList>

        <TabsContent value="stake">
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-xs text-muted-foreground">
              Stake $EGG-MOTO LP tokens to earn $EGG rewards over ~52,560 blocks (~12 months).
            </p>
            <Input
              label="LP Amount"
              value={stakeAmount}
              onChange={setStakeAmount}
              placeholder="0.00"
              suffix="LP"
              type="text"
            />
            <Button
              onClick={handleStake}
              disabled={isLoading || stakeAmount === ''}
              loading={isLoading}
              fullWidth
            >
              Stake LP
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="unstake">
          <div className="flex flex-col gap-4 pt-4">
            <p className="text-xs text-muted-foreground">
              Remove your staked LP tokens.
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Currently Staked</span>
              <span className="font-medium text-foreground">
                {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} LP
              </span>
            </div>
            <Input
              label="LP Amount"
              value={unstakeAmount}
              onChange={setUnstakeAmount}
              placeholder="0.00"
              suffix="LP"
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
              Unstake LP
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function FarmRewards({
  pendingEgg,
  onClaim,
  isLoading,
}: {
  readonly pendingEgg: bigint;
  readonly onClaim: () => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <Card title="Farm Rewards" glow="egg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pending $EGG</span>
          <span className="font-semibold text-egg">
            {FormatService.formatBigIntWithDecimals(pendingEgg, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <Button
          onClick={onClaim}
          disabled={isLoading || pendingEgg === 0n}
          loading={isLoading}
          fullWidth
        >
          Claim $EGG
        </Button>
      </div>
    </Card>
  );
}

function FarmPage(): React.ReactElement {
  const farming = useLPMining();
  const { isConnected, openConnectModal } = useWallet();
  const { blockHeight } = useBlockHeight();

  const handleStakeLP = useCallback(
    (amount: bigint): void => {
      void farming.stakeLP(amount);
    },
    [farming],
  );

  const handleUnstakeLP = useCallback(
    (amount: bigint): void => {
      void farming.unstakeLP(amount);
    },
    [farming],
  );

  const handleClaimRewards = useCallback((): void => {
    void farming.claimRewards();
  }, [farming]);

  if (!isConnected) {
    return (
      <PageLayout title="LP Mining">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="LP Mining">
              <p className="mb-4 text-sm text-muted-foreground">
                Stake $EGG-MOTO LP tokens to earn $EGG rewards over ~52,560 blocks (~12 months) following a decay curve. After emissions end, the contract remains for unstaking but no new rewards are distributed.
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

  if (farming.isLoading && farming.position === null) {
    return (
      <PageLayout title="LP Mining">
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LP Mining">
      <div className="flex flex-col gap-6">
        <EmissionChart
          position={farming.position}
          blockHeight={blockHeight}
          isLoading={farming.isLoading}
        />
        <div className="mx-auto w-full max-w-lg flex flex-col gap-6">
          <StakeUnstakeTabs
            position={farming.position}
            onStakeLP={handleStakeLP}
            onUnstakeLP={handleUnstakeLP}
            isLoading={farming.isLoading}
          />
          <FarmRewards
            pendingEgg={farming.position?.pendingEgg ?? 0n}
            onClaim={handleClaimRewards}
            isLoading={farming.isLoading}
          />
        </div>
        <CookingProgress
          status={farming.txState.status}
          txId={farming.txState.txId}
          error={farming.txState.error}
          message={farming.txState.message}
          steps={FARM_STEPS}
          successMessage="LP tokens staked. $EGG rewards are cooking!"
        />
        <OnThePan txState={farming.txState} />
      </div>
    </PageLayout>
  );
}

export { FarmPage };
