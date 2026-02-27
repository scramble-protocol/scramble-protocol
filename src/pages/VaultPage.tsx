import React, { useState, useCallback } from 'react';
import type { VaultPosition, VaultStats } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useThePan, useWallet, useBlockHeight, useEggToken } from '../hooks/index.js';
import { Card, Button, Input, Spinner, Badge, CookingProgress, OnThePan, type CookingStep } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

const PAN_STEPS: readonly CookingStep[] = [
  { id: 'approving', label: 'Greasing', description: 'Greasing the pan... Confirm approval in your wallet.' },
  { id: 'confirming', label: 'Preheating', description: 'Waiting for approval to bake into a Bitcoin block...' },
  { id: 'simulating', label: 'Heating Up', description: 'Warming the pan...' },
  { id: 'signing', label: 'Flipping', description: 'Flip that egg! Confirm in your wallet.' },
  { id: 'broadcasting', label: 'Sizzling', description: 'Your MOTO is sizzling on the pan!' },
  { id: 'confirmed', label: 'Plated', description: 'MOTO deposited. The kitchen is cooking!' },
];

const TOKEN_DECIMALS = 18;

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: 'TVL', value: `${FormatService.formatBigIntWithDecimals(stats?.tvl ?? 0n, TOKEN_DECIMALS, 2)} MOTO` },
        { label: 'Total Shell Token', value: FormatService.formatBigIntWithDecimals(stats?.totalShells ?? 0n, TOKEN_DECIMALS, 2) },
        { label: 'Butter Level', value: FormatService.formatBigIntWithDecimals(stats?.butterLevel ?? 0n, TOKEN_DECIMALS, 2) },
        { label: 'Sizzle Rate', value: FormatService.formatBigIntWithDecimals(stats?.sizzleRate ?? 0n, TOKEN_DECIMALS, 4), highlight: true },
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
    <Card title="Deposit MOTO" subtitle="Deposit MOTO into The Pan to receive Shell Token — your proportional share of the vault.">
      <div className="flex flex-col gap-4">
        <Input
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          suffix="MOTO"
          type="text"
        />
        <Button
          onClick={handleDeposit}
          disabled={isLoading || amount === ''}
          loading={isLoading}
          fullWidth
        >
          Deposit
        </Button>
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
      setShares(FormatService.formatTokenAmount(position.shells, TOKEN_DECIMALS));
    }
  }, [position]);

  return (
    <Card title="Withdraw" subtitle="Return Shell Token to withdraw MOTO. Yoke Tax applies based on blocks since deposit.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your Shell Token</span>
          <span className="font-medium text-foreground">
            {FormatService.formatBigIntWithDecimals(position?.shells ?? 0n, TOKEN_DECIMALS, 4)}
          </span>
        </div>
        <Input
          label="Shell Token to withdraw"
          value={shares}
          onChange={setShares}
          placeholder="0.00"
          suffix="SHELL"
          maxButton
          onMax={handleMax}
          type="text"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Yoke Tax</span>
          <span className="font-medium text-sizzle">{String(yokeTax)}%</span>
        </div>
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pending Sizzle</span>
          <span className="font-semibold text-sizzle">
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Boost</span>
          <span className="font-semibold text-egg">
            {FormatService.formatBigIntWithDecimals(eggBoost, TOKEN_DECIMALS, 4)} EGG
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Wallet Balance</span>
          <span className="font-medium text-foreground">
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
        <div className="flex gap-2">
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
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge variant={cookLevel >= 3 ? 'egg' : 'info'}>
          Level {String(cookLevel)}
        </Badge>
        <p className="font-retro text-xs text-foreground">{levelName}</p>
        <div className="flex items-center justify-between w-full text-sm">
          <span className="text-muted-foreground">Blocks deposited</span>
          <span className="font-medium text-foreground">{blocksSinceDeposit.toString()}</span>
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

  // Flip to true when The Pan is ready to launch
  const PAN_LIVE = false;

  if (!PAN_LIVE) {
    return (
      <PageLayout title="The Pan">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-lg">
            <Card title="The Pan — Coming Soon">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  The Pan is the heart of Scramble. Deposit MOTO tokens into the vault to receive Shell Tokens — your proportional share of everything in the kitchen.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your MOTO is automatically farmed for yield via The Spatula. Early withdrawals are penalised with The Yoke Tax, and those fees are redistributed to loyal holders through The Sizzle drip. The longer you stay, the higher your Cook Level climbs — from Raw Egg all the way to Fully Scrambled (2x rewards).
                </p>
                <p className="text-sm text-muted-foreground">
                  Lock $EGG alongside your deposit for an extra +0.25x boost.
                </p>
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-center">
                  <p className="font-retro text-xs text-primary">Launching Soon</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isConnected) {
    return (
      <PageLayout title="The Pan">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="The Pan">
              <p className="mb-4 text-sm text-muted-foreground">
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="The Pan">
      <div className="flex flex-col gap-6">
        <VaultStatsSection stats={pan.stats} isLoading={pan.isLoading} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DepositForm onDeposit={handleDeposit} isLoading={pan.isLoading} />
            <WithdrawForm
              position={pan.position}
              currentBlock={blockHeight}
              onWithdraw={handleWithdraw}
              isLoading={pan.isLoading}
            />
          </div>
          <div className="flex flex-col gap-6">
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
        <CookingProgress
          status={pan.txState.status}
          txId={pan.txState.txId}
          error={pan.txState.error}
          message={pan.txState.message}
          steps={PAN_STEPS}
          successMessage="Your MOTO is in the pan. Shell tokens served!"
        />
        <OnThePan txState={pan.txState} />
      </div>
    </PageLayout>
  );
}

export { VaultPage };
