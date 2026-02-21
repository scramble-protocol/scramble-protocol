import React, { useState, useCallback } from 'react';
import type { VaultPosition, VaultStats } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useThePan, useWallet, useBlockHeight, useEggToken } from '../hooks/index.js';
import { Card, Button, Input, Spinner, TransactionStatus, Badge } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/vault-page.css';

const TOKEN_DECIMALS = 8;

function calculateYokeTaxPercent(
  depositBlock: bigint,
  currentBlock: bigint,
): number {
  if (currentBlock <= depositBlock) {
    return 30;
  }
  const blocksSinceDeposit = currentBlock - depositBlock;
  if (blocksSinceDeposit < 1008n) {
    return 30;
  }
  if (blocksSinceDeposit < 4320n) {
    return 20;
  }
  if (blocksSinceDeposit < 25920n) {
    return 10;
  }
  return 5;
}

function VaultStatsSection({
  stats,
  isLoading,
}: {
  readonly stats: VaultStats | null;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <div className="vault-page__stats">
      <div className="vault-stats__grid">
        <div className="vault-stats__box">
          <p className="vault-stats__label">TVL</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatBigIntWithDecimals(stats?.tvl ?? 0n, TOKEN_DECIMALS, 2)} MOTO
            </p>
          )}
        </div>
        <div className="vault-stats__box">
          <p className="vault-stats__label">Total Yolks</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatBigIntWithDecimals(stats?.totalYolks ?? 0n, TOKEN_DECIMALS, 2)}
            </p>
          )}
        </div>
        <div className="vault-stats__box">
          <p className="vault-stats__label">Butter Level</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatBigIntWithDecimals(stats?.butterLevel ?? 0n, TOKEN_DECIMALS, 2)}
            </p>
          )}
        </div>
        <div className="vault-stats__box">
          <p className="vault-stats__label">Sizzle Rate</p>
          {isLoading ? (
            <div className="vault-stats__skeleton" />
          ) : (
            <p className="vault-stats__value vault-stats__value--sizzle">
              {FormatService.formatBigIntWithDecimals(stats?.sizzleRate ?? 0n, TOKEN_DECIMALS, 4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DepositForm({
  onDeposit,
  isLoading,
}: {
  readonly onDeposit: (amount: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [amount, setAmount] = useState<string>('');

  const handleDeposit = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(amount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onDeposit(parsed);
      setAmount('');
    }
  }, [amount, onDeposit]);

  return (
    <Card title="Deposit MOTO" subtitle="Deposit MOTO into The Pan to receive Yolks — your proportional share of the vault.">
      <div className="deposit-form">
        <Input
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="MOTO"
          type="text"
        />
        <div className="deposit-form__actions">
          <Button
            onClick={handleDeposit}
            disabled={isLoading || amount === ''}
            loading={isLoading}
            fullWidth
          >
            Deposit
          </Button>
        </div>
      </div>
    </Card>
  );
}

function WithdrawForm({
  position,
  currentBlock,
  onWithdraw,
  isLoading,
}: {
  readonly position: VaultPosition | null;
  readonly currentBlock: bigint;
  readonly onWithdraw: (shares: bigint) => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [shares, setShares] = useState<string>('');

  const yokeTax = position !== null
    ? calculateYokeTaxPercent(position.depositBlock, currentBlock)
    : 30;

  const handleWithdraw = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(shares, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onWithdraw(parsed);
      setShares('');
    }
  }, [shares, onWithdraw]);

  const handleMax = useCallback((): void => {
    if (position !== null) {
      setShares(FormatService.formatTokenAmount(position.yolks, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card title="Withdraw" subtitle="Return Yolks to withdraw MOTO. Yoke Tax applies based on blocks since deposit.">
      <div className="deposit-form">
        <div className="deposit-form__balance">
          <span>Your Yolks</span>
          <span className="deposit-form__balance-value">
            {FormatService.formatBigIntWithDecimals(position?.yolks ?? 0n, TOKEN_DECIMALS, 4)}
          </span>
        </div>
        <Input
          label="Yolks to withdraw"
          value={shares}
          onChange={setShares}
          placeholder="0.00"
          suffix="Yolks"
          maxButton
          onMax={handleMax}
          type="text"
        />
        <div className="deposit-form__estimate">
          <span className="deposit-form__estimate-label">Yoke Tax</span>
          <span className="deposit-form__estimate-value">{String(yokeTax)}%</span>
        </div>
        <div className="deposit-form__actions">
          <Button
            onClick={handleWithdraw}
            disabled={isLoading || shares === ''}
            loading={isLoading}
            variant="secondary"
            fullWidth
          >
            Withdraw
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SizzleClaim({
  pendingSizzle,
  onClaim,
  isLoading,
}: {
  readonly pendingSizzle: bigint;
  readonly onClaim: () => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <Card title="Sizzle Rewards" glow="sizzle">
      <div className="vault-page__sizzle-claim">
        <div className="vault-page__reward-row">
          <span className="vault-page__reward-label">Pending Sizzle</span>
          <span className="vault-page__reward-value vault-page__reward-value--sizzle">
            {FormatService.formatBigIntWithDecimals(pendingSizzle, TOKEN_DECIMALS, 4)}
          </span>
        </div>
        <Button
          onClick={onClaim}
          disabled={isLoading || pendingSizzle === 0n}
          loading={isLoading}
          variant="primary"
          fullWidth
        >
          Claim Sizzle
        </Button>
      </div>
    </Card>
  );
}

function EggBoostSection({
  eggBoost,
  eggBalance,
  onDepositBoost,
  onWithdrawBoost,
  isLoading,
}: {
  readonly eggBoost: bigint;
  readonly eggBalance: bigint;
  readonly onDepositBoost: (amount: bigint) => void;
  readonly onWithdrawBoost: () => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  const [boostAmount, setBoostAmount] = useState<string>('');

  const handleDepositBoost = useCallback((): void => {
    const parsed = FormatService.parseTokenAmount(boostAmount, TOKEN_DECIMALS);
    if (parsed > 0n) {
      onDepositBoost(parsed);
      setBoostAmount('');
    }
  }, [boostAmount, onDepositBoost]);

  const handleMax = useCallback((): void => {
    setBoostAmount(FormatService.formatTokenAmount(eggBalance, TOKEN_DECIMALS));
  }, [eggBalance]);

  return (
    <Card title="$EGG Boost" subtitle="Deposit $EGG alongside your Pan deposit for +0.25x Cook Level bonus." glow="egg">
      <div className="vault-page__egg-boost">
        <div className="vault-page__reward-row">
          <span className="vault-page__reward-label">Current Boost</span>
          <span className="vault-page__reward-value vault-page__reward-value--egg">
            {FormatService.formatBigIntWithDecimals(eggBoost, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <div className="vault-page__reward-row">
          <span className="vault-page__reward-label">Wallet Balance</span>
          <span className="vault-page__reward-value">
            {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <Input
          label="Boost Amount"
          value={boostAmount}
          onChange={setBoostAmount}
          placeholder="0.00"
          suffix="EGG"
          maxButton
          onMax={handleMax}
          type="text"
        />
        <div className="vault-page__boost-actions">
          <Button
            onClick={handleDepositBoost}
            disabled={isLoading || boostAmount === ''}
            loading={isLoading}
            size="sm"
          >
            Add Boost
          </Button>
          <Button
            onClick={onWithdrawBoost}
            disabled={isLoading || eggBoost === 0n}
            loading={isLoading}
            variant="secondary"
            size="sm"
          >
            Remove Boost
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CookLevelDisplay({
  cookLevel,
  depositBlock,
  currentBlock,
}: {
  readonly cookLevel: number;
  readonly depositBlock: bigint;
  readonly currentBlock: bigint;
}): React.ReactElement {
  const LEVEL_NAMES: readonly string[] = ['Raw Egg', 'Soft Boiled', 'Over Easy', 'Fully Scrambled'] as const;
  const levelName = LEVEL_NAMES[cookLevel] ?? 'Raw Egg';
  const blocksSinceDeposit = currentBlock > depositBlock ? currentBlock - depositBlock : 0n;

  return (
    <Card title="Cook Level">
      <div className="vault-page__cook-level">
        <div className="vault-page__cook-level-badge">
          <Badge variant={cookLevel >= 3 ? 'egg' : 'info'}>
            Level {String(cookLevel)}
          </Badge>
        </div>
        <p className="vault-page__cook-level-name">{levelName}</p>
        <div className="vault-page__cook-level-detail">
          <span className="vault-page__cook-level-label">Blocks deposited</span>
          <span className="vault-page__cook-level-value">{blocksSinceDeposit.toString()}</span>
        </div>
      </div>
    </Card>
  );
}

function VaultPage(): React.ReactElement {
  const pan = useThePan();
  const { isConnected, openConnectModal } = useWallet();
  const { blockHeight } = useBlockHeight();
  const egg = useEggToken();

  const handleDeposit = useCallback(
    (amount: bigint): void => {
      void pan.deposit(amount);
    },
    [pan],
  );

  const handleWithdraw = useCallback(
    (shares: bigint): void => {
      void pan.withdraw(shares);
    },
    [pan],
  );

  const handleClaimSizzle = useCallback((): void => {
    void pan.claimSizzle();
  }, [pan]);

  const handleDepositEggBoost = useCallback(
    (amount: bigint): void => {
      void pan.depositEggBoost(amount);
    },
    [pan],
  );

  const handleWithdrawEggBoost = useCallback((): void => {
    void pan.withdrawEggBoost();
  }, [pan]);

  if (!isConnected) {
    return (
      <PageLayout title="The Pan">
        <div className="vault-page">
          <div className="vault-page__connect-prompt">
            <Card title="The Pan">
              <p className="vault-page__connect-text">
                Connect your wallet to access The Pan vault.
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

  if (pan.isLoading && pan.stats === null) {
    return (
      <PageLayout title="The Pan">
        <div className="vault-page">
          <div className="vault-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="The Pan">
      <div className="vault-page">
        <VaultStatsSection stats={pan.stats} isLoading={pan.isLoading} />
        <div className="vault-page__grid">
          <div className="vault-page__left-column">
            <DepositForm onDeposit={handleDeposit} isLoading={pan.isLoading} />
            <WithdrawForm
              position={pan.position}
              currentBlock={blockHeight}
              onWithdraw={handleWithdraw}
              isLoading={pan.isLoading}
            />
          </div>
          <div className="vault-page__right-column">
            <SizzleClaim
              pendingSizzle={pan.position?.pendingSizzle ?? 0n}
              onClaim={handleClaimSizzle}
              isLoading={pan.isLoading}
            />
            <EggBoostSection
              eggBoost={pan.position?.eggBoost ?? 0n}
              eggBalance={egg.balance}
              onDepositBoost={handleDepositEggBoost}
              onWithdrawBoost={handleWithdrawEggBoost}
              isLoading={pan.isLoading || egg.isLoading}
            />
            <CookLevelDisplay
              cookLevel={pan.position?.cookLevel ?? 0}
              depositBlock={pan.position?.depositBlock ?? 0n}
              currentBlock={blockHeight}
            />
          </div>
        </div>
        <TransactionStatus state={pan.txState} />
      </div>
    </PageLayout>
  );
}

export { VaultPage };
