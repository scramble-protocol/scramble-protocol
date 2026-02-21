import React, { useState, useCallback } from 'react';
import type { StakingPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useEggStaking, useEggToken, useWallet } from '../hooks/index.js';
import { Card, Button, Input, Spinner, TransactionStatus } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/stake-page.css';

const TOKEN_DECIMALS = 8;

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
    <div className="stake-page__stats">
      <div className="vault-stats__grid">
        <div className="vault-stats__box">
          <p className="vault-stats__label">Your $EGG Balance</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 2)} EGG
            </p>
          )}
        </div>
        <div className="vault-stats__box">
          <p className="vault-stats__label">Staked</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatBigIntWithDecimals(position?.staked ?? 0n, TOKEN_DECIMALS, 2)} EGG
            </p>
          )}
        </div>
        <div className="vault-stats__box">
          <p className="vault-stats__label">Pending MOTO Rewards</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value vault-stats__value--sizzle">
              {FormatService.formatBigIntWithDecimals(position?.pendingRewards ?? 0n, TOKEN_DECIMALS, 4)} MOTO
            </p>
          )}
        </div>
      </div>
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
      <div className="deposit-form">
        <div className="deposit-form__balance">
          <span>Available</span>
          <span className="deposit-form__balance-value">
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
        <div className="deposit-form__actions">
          <Button
            onClick={handleStake}
            disabled={isLoading || amount === ''}
            loading={isLoading}
            fullWidth
          >
            Stake
          </Button>
        </div>
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
      <div className="deposit-form">
        <div className="deposit-form__balance">
          <span>Currently Staked</span>
          <span className="deposit-form__balance-value">
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
        <div className="deposit-form__actions">
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
      <div className="stake-page__rewards">
        <div className="stake-page__reward-row">
          <span className="stake-page__reward-label">Pending MOTO Rewards</span>
          <span className="stake-page__reward-value">
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
        <div className="stake-page">
          <div className="stake-page__connect-prompt">
            <Card title="Stake $EGG">
              <p className="stake-page__connect-text">
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
        <div className="stake-page">
          <div className="stake-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Stake $EGG">
      <div className="stake-page">
        <StakingStats
          position={staking.position}
          eggBalance={egg.balance}
          isLoading={staking.isLoading || egg.isLoading}
        />
        <div className="stake-page__grid">
          <div className="stake-page__left-column">
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
          <div className="stake-page__right-column">
            <StakingRewards
              pendingRewards={staking.position?.pendingRewards ?? 0n}
              onClaim={handleClaimRewards}
              isLoading={staking.isLoading}
            />
          </div>
        </div>
        <TransactionStatus state={staking.txState} />
      </div>
    </PageLayout>
  );
}

export { StakePage };
