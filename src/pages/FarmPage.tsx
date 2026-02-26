import React, { useState, useCallback } from 'react';
import type { FarmPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useLPMining, useWallet, useBlockHeight } from '../hooks/index.js';
import { Card, Button, Input, Spinner, TransactionStatus } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

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

function LPStake({
  onStakeLP,
  isLoading,
}: {
  readonly onStakeLP: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState<string>('');

  const handleStake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(amount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onStakeLP(parsed);
      setAmount('');
    }
  }, [amount, onStakeLP]);

  return (
    <Card title="Stake $EGG-MOTO LP" subtitle="Stake $EGG-MOTO LP tokens to earn $EGG rewards over ~52,560 blocks (~12 months)">
      <div className="flex flex-col gap-4">
        <Input
          label="LP Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="LP"
          type="text"
        />
        <Button
          onClick={handleStake}
          disabled={isLoading || amount === ''}
          loading={isLoading}
          fullWidth
        >
          Stake LP
        </Button>
      </div>
    </Card>
  );
}

function LPUnstake({
  position,
  onUnstakeLP,
  isLoading,
}: {
  readonly position: FarmPosition | null;
  readonly onUnstakeLP: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState<string>('');

  const handleUnstake = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(amount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onUnstakeLP(parsed);
      setAmount('');
    }
  }, [amount, onUnstakeLP]);

  const handleMax = useCallback((): void => {
    if (position !== null) {
      setAmount(FormatService.formatTokenAmount(position.staked, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card title="Unstake $EGG-MOTO LP" subtitle="Remove your staked LP tokens">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Currently Staked</span>
          <span className="font-medium text-foreground">
            {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} LP
          </span>
        </div>
        <Input
          label="LP Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="LP"
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
          Unstake LP
        </Button>
      </div>
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
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <LPStake onStakeLP={handleStakeLP} isLoading={farming.isLoading} />
            <LPUnstake
              position={farming.position}
              onUnstakeLP={handleUnstakeLP}
              isLoading={farming.isLoading}
            />
          </div>
          <div className="flex flex-col gap-6">
            <FarmRewards
              pendingEgg={farming.position?.pendingEgg ?? 0n}
              onClaim={handleClaimRewards}
              isLoading={farming.isLoading}
            />
          </div>
        </div>
        <TransactionStatus state={farming.txState} />
      </div>
    </PageLayout>
  );
}

export { FarmPage };
