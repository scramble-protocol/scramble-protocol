import React from 'react';
import type { VaultPosition, StakingPosition, FarmPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useWallet, useThePan, useEggToken, useEggStaking, useLPMining } from '../hooks/index.js';
import { Card, Button, Spinner, Badge } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

const TOKEN_DECIMALS = 18;

function BalanceOverview({
  btcBalance,
  eggBalance,
  eggSupply,
}: {
  readonly btcBalance: bigint;
  readonly eggBalance: bigint;
  readonly eggSupply: bigint;
}): React.ReactElement {
  return (
    <Card title="Balances">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">BTC Balance</span>
          <span className="text-sm font-semibold text-foreground">
            {FormatService.formatBigIntWithDecimals(btcBalance, TOKEN_DECIMALS, 4)} BTC
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">$EGG Balance</span>
          <span className="text-sm font-semibold text-egg">
            {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 2)} EGG
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">$EGG Total Supply</span>
          <span className="text-sm font-semibold text-foreground">
            {FormatService.formatBigIntWithDecimals(eggSupply, TOKEN_DECIMALS, 0)} EGG
          </span>
        </div>
      </div>
    </Card>
  );
}

function VaultPositionCard({
  position,
}: {
  readonly position: VaultPosition | null;
}): React.ReactElement {
  const hasPosition = position !== null && position.shells > 0n;

  return (
    <Card title="The Pan" glow={hasPosition ? 'egg' : 'none'}>
      {hasPosition ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shell Token</span>
            <span className="font-medium text-foreground">
              {FormatService.formatBigIntWithDecimals(position.shells, TOKEN_DECIMALS, 4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">EGG Boost</span>
            <span className="font-medium text-foreground">
              {FormatService.formatBigIntWithDecimals(position.eggBoost, TOKEN_DECIMALS, 4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending Sizzle</span>
            <span className="font-semibold text-sizzle">
              {FormatService.formatBigIntWithDecimals(position.pendingSizzle, TOKEN_DECIMALS, 4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cook Level</span>
            <Badge variant="egg">Level {String(position.cookLevel)}</Badge>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No vault position</p>
      )}
    </Card>
  );
}

function StakingPositionCard({
  position,
}: {
  readonly position: StakingPosition | null;
}): React.ReactElement {
  const hasPosition = position !== null && position.staked > 0n;

  return (
    <Card title="$EGG Staking" glow={hasPosition ? 'egg' : 'none'}>
      {hasPosition ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Staked $EGG</span>
            <span className="font-medium text-foreground">
              {FormatService.formatBigIntWithDecimals(position.staked, TOKEN_DECIMALS, 4)} EGG
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending MOTO Rewards</span>
            <span className="font-semibold text-sizzle">
              {FormatService.formatBigIntWithDecimals(position.pendingRewards, TOKEN_DECIMALS, 4)} MOTO
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No staking position</p>
      )}
    </Card>
  );
}

function FarmPositionCard({
  position,
}: {
  readonly position: FarmPosition | null;
}): React.ReactElement {
  const hasPosition = position !== null && position.staked > 0n;

  return (
    <Card title="$EGG-MOTO LP Mining" glow={hasPosition ? 'egg' : 'none'}>
      {hasPosition ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">$EGG-MOTO LP Staked</span>
            <span className="font-medium text-foreground">
              {FormatService.formatBigIntWithDecimals(position.staked, TOKEN_DECIMALS, 4)} LP
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending $EGG</span>
            <span className="font-semibold text-egg">
              {FormatService.formatBigIntWithDecimals(position.pendingEgg, TOKEN_DECIMALS, 4)} EGG
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No farming position</p>
      )}
    </Card>
  );
}

function ProtocolStats({
  vaultTVL,
  totalEggStaked,
  totalLPStaked,
}: {
  readonly vaultTVL: bigint;
  readonly totalEggStaked: bigint;
  readonly totalLPStaked: bigint;
}): React.ReactElement {
  return (
    <Card title="Protocol Overview" subtitle="Three yield engines: The Pan, $EGG Staking, $EGG-MOTO LP Mining">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Vault TVL', value: `${FormatService.formatBigIntWithDecimals(vaultTVL, TOKEN_DECIMALS, 2)} MOTO` },
          { label: 'EGG Staked', value: `${FormatService.formatBigIntWithDecimals(totalEggStaked, TOKEN_DECIMALS, 2)} EGG` },
          { label: '$EGG-MOTO LP Staked', value: `${FormatService.formatBigIntWithDecimals(totalLPStaked, TOKEN_DECIMALS, 2)} LP` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md border border-border bg-secondary/50 p-3">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <p className="mt-1 text-sm font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DashboardPage(): React.ReactElement {
  const { isConnected, balance, openConnectModal } = useWallet();
  const pan = useThePan();
  const egg = useEggToken();
  const staking = useEggStaking();
  const farming = useLPMining();

  const isLoading = pan.isLoading || egg.isLoading || staking.isLoading || farming.isLoading;

  if (!isConnected) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="Dashboard">
              <p className="mb-4 text-sm text-muted-foreground">
                Connect your wallet to view your positions across all three yield engines: The Pan (vault), $EGG Staking (5% of harvests in MOTO), and $EGG-MOTO LP Mining ($EGG emissions).
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

  if (isLoading && pan.stats === null) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <BalanceOverview
          btcBalance={balance}
          eggBalance={egg.balance}
          eggSupply={egg.totalSupply}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <VaultPositionCard position={pan.position} />
          <StakingPositionCard position={staking.position} />
          <FarmPositionCard position={farming.position} />
        </div>
        <ProtocolStats
          vaultTVL={pan.stats?.tvl ?? 0n}
          totalEggStaked={staking.position?.staked ?? 0n}
          totalLPStaked={farming.position?.staked ?? 0n}
        />
      </div>
    </PageLayout>
  );
}

export { DashboardPage };
