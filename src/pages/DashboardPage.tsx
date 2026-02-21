import React from 'react';
import type { VaultPosition, StakingPosition, FarmPosition } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useWallet, useThePan, useEggToken, useEggStaking, useLPMining } from '../hooks/index.js';
import { Card, Button, Spinner, Badge } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/dashboard-page.css';

const TOKEN_DECIMALS = 8;

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
    <div className="dashboard-page__balances">
      <Card title="Balances">
        <div className="dashboard-page__balance-grid">
          <div className="dashboard-page__balance-item">
            <span className="dashboard-page__balance-label">BTC Balance</span>
            <span className="dashboard-page__balance-value">
              {FormatService.formatBigIntWithDecimals(btcBalance, TOKEN_DECIMALS, 4)} BTC
            </span>
          </div>
          <div className="dashboard-page__balance-item">
            <span className="dashboard-page__balance-label">$EGG Balance</span>
            <span className="dashboard-page__balance-value dashboard-page__balance-value--egg">
              {FormatService.formatBigIntWithDecimals(eggBalance, TOKEN_DECIMALS, 2)} EGG
            </span>
          </div>
          <div className="dashboard-page__balance-item">
            <span className="dashboard-page__balance-label">$EGG Total Supply</span>
            <span className="dashboard-page__balance-value">
              {FormatService.formatBigIntWithDecimals(eggSupply, TOKEN_DECIMALS, 0)} EGG
            </span>
          </div>
        </div>
      </Card>
    </div>
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
      <div className="dashboard-page__position">
        {hasPosition ? (
          <>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Shell Token</span>
              <span className="dashboard-page__position-value">
                {FormatService.formatBigIntWithDecimals(position.shells, TOKEN_DECIMALS, 4)}
              </span>
            </div>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">EGG Boost</span>
              <span className="dashboard-page__position-value">
                {FormatService.formatBigIntWithDecimals(position.eggBoost, TOKEN_DECIMALS, 4)}
              </span>
            </div>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Pending Sizzle</span>
              <span className="dashboard-page__position-value dashboard-page__position-value--sizzle">
                {FormatService.formatBigIntWithDecimals(position.pendingSizzle, TOKEN_DECIMALS, 4)}
              </span>
            </div>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Cook Level</span>
              <Badge variant="egg">Level {String(position.cookLevel)}</Badge>
            </div>
          </>
        ) : (
          <p className="dashboard-page__empty-text">No vault position</p>
        )}
      </div>
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
      <div className="dashboard-page__position">
        {hasPosition ? (
          <>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Staked $EGG</span>
              <span className="dashboard-page__position-value">
                {FormatService.formatBigIntWithDecimals(position.staked, TOKEN_DECIMALS, 4)} EGG
              </span>
            </div>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Pending MOTO Rewards</span>
              <span className="dashboard-page__position-value dashboard-page__position-value--sizzle">
                {FormatService.formatBigIntWithDecimals(position.pendingRewards, TOKEN_DECIMALS, 4)} MOTO
              </span>
            </div>
          </>
        ) : (
          <p className="dashboard-page__empty-text">No staking position</p>
        )}
      </div>
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
      <div className="dashboard-page__position">
        {hasPosition ? (
          <>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">$EGG-MOTO LP Staked</span>
              <span className="dashboard-page__position-value">
                {FormatService.formatBigIntWithDecimals(position.staked, TOKEN_DECIMALS, 4)} LP
              </span>
            </div>
            <div className="dashboard-page__position-row">
              <span className="dashboard-page__position-label">Pending $EGG</span>
              <span className="dashboard-page__position-value dashboard-page__position-value--egg">
                {FormatService.formatBigIntWithDecimals(position.pendingEgg, TOKEN_DECIMALS, 4)} EGG
              </span>
            </div>
          </>
        ) : (
          <p className="dashboard-page__empty-text">No farming position</p>
        )}
      </div>
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
    <div className="dashboard-page__protocol-stats">
      <Card title="Protocol Overview" subtitle="Three yield engines: The Pan, $EGG Staking, $EGG-MOTO LP Mining">
        <div className="dashboard-page__stats-grid">
          <div className="dashboard-page__stat-box">
            <span className="dashboard-page__stat-label">Vault TVL</span>
            <span className="dashboard-page__stat-value">
              {FormatService.formatBigIntWithDecimals(vaultTVL, TOKEN_DECIMALS, 2)} MOTO
            </span>
          </div>
          <div className="dashboard-page__stat-box">
            <span className="dashboard-page__stat-label">EGG Staked</span>
            <span className="dashboard-page__stat-value">
              {FormatService.formatBigIntWithDecimals(totalEggStaked, TOKEN_DECIMALS, 2)} EGG
            </span>
          </div>
          <div className="dashboard-page__stat-box">
            <span className="dashboard-page__stat-label">$EGG-MOTO LP Staked</span>
            <span className="dashboard-page__stat-value">
              {FormatService.formatBigIntWithDecimals(totalLPStaked, TOKEN_DECIMALS, 2)} LP
            </span>
          </div>
        </div>
      </Card>
    </div>
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
        <div className="dashboard-page">
          <div className="dashboard-page__connect-prompt">
            <Card title="Dashboard">
              <p className="dashboard-page__connect-text">
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
        <div className="dashboard-page">
          <div className="dashboard-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Dashboard">
      <div className="dashboard-page">
        <BalanceOverview
          btcBalance={balance}
          eggBalance={egg.balance}
          eggSupply={egg.totalSupply}
        />
        <div className="dashboard-page__positions-grid">
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
