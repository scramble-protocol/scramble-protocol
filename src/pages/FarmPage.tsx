import React, { useState, useCallback } from 'react';
import type { FarmPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useLPMining, useWallet, useBlockHeight } from '../hooks/index.js';
import { Card, Button, Input, Spinner, TransactionStatus } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/farm-page.css';

const TOKEN_DECIMALS = 8;

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
    <div className="farm-page__emission">
      <Card title="$EGG-MOTO LP Mining Emissions">
        <div className="farm-page__emission-grid">
          <div className="farm-page__emission-item">
            <span className="farm-page__emission-label">Current Block</span>
            {isLoading ? (
              <div className="vault-stats__skeleton" />
            ) : (
              <span className="farm-page__emission-value">{blockHeight.toString()}</span>
            )}
          </div>
          <div className="farm-page__emission-item">
            <span className="farm-page__emission-label">Your $EGG-MOTO LP Staked</span>
            {isLoading ? (
              <div className="vault-stats__skeleton" />
            ) : (
              <span className="farm-page__emission-value">
                {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 4)} LP
              </span>
            )}
          </div>
          <div className="farm-page__emission-item">
            <span className="farm-page__emission-label">Pending $EGG</span>
            {isLoading ? (
              <div className="vault-stats__skeleton" />
            ) : (
              <span className="farm-page__emission-value farm-page__emission-value--egg">
                {FormatService.formatBigIntWithDecimals(position?.pendingEgg ?? 0n, TOKEN_DECIMALS, 4)} EGG
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
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
      <div className="lp-stake">
        <Input
          label="LP Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="LP"
          type="text"
        />
        <div className="lp-stake__actions">
          <Button
            onClick={handleStake}
            disabled={isLoading || amount === ''}
            loading={isLoading}
            fullWidth
          >
            Stake LP
          </Button>
        </div>
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
      <div className="lp-unstake">
        <div className="lp-unstake__balance">
          <span className="lp-unstake__balance-label">Currently Staked</span>
          <span className="lp-unstake__balance-value">
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
        <div className="lp-unstake__actions">
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
      <div className="farm-page__rewards">
        <div className="farm-page__reward-row">
          <span className="farm-page__reward-label">Pending $EGG</span>
          <span className="farm-page__reward-value">
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
        <div className="farm-page">
          <div className="farm-page__connect-prompt">
            <Card title="LP Mining">
              <p className="farm-page__connect-text">
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
        <div className="farm-page">
          <div className="farm-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LP Mining">
      <div className="farm-page">
        <EmissionChart
          position={farming.position}
          blockHeight={blockHeight}
          isLoading={farming.isLoading}
        />
        <div className="farm-page__grid">
          <div className="farm-page__left-column">
            <LPStake onStakeLP={handleStakeLP} isLoading={farming.isLoading} />
            <LPUnstake
              position={farming.position}
              onUnstakeLP={handleUnstakeLP}
              isLoading={farming.isLoading}
            />
          </div>
          <div className="farm-page__right-column">
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
