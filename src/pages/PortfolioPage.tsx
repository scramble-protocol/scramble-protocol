import React from 'react';
import { PageLayout } from '../components/layout/index.js';
import { useWallet, useThePan, useEggToken, useEggStaking, useLPMining } from '../hooks/index.js';
import { Card, Button, Spinner } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/portfolio-page.css';

const TOKEN_DECIMALS = 8;

function EarningsSummary({
  vaultClaimed,
  stakingClaimed,
  farmingClaimed,
}: {
  readonly vaultClaimed: bigint;
  readonly stakingClaimed: bigint;
  readonly farmingClaimed: bigint;
}): React.ReactElement {
  return (
    <div className="portfolio-page__earnings">
      <h2 className="portfolio-page__section-heading">Earnings Summary</h2>
      <div className="portfolio-page__earnings-grid">
        <Card title="Spatula Farming">
          <div className="portfolio-page__earning-card">
            <span className="portfolio-page__earning-value">
              {FormatService.formatBigIntWithDecimals(vaultClaimed, TOKEN_DECIMALS, 4)} MOTO
            </span>
            <span className="portfolio-page__earning-label">Total Sizzle claimed from The Pan</span>
          </div>
        </Card>
        <Card title="Yoke Tax Redistribution">
          <div className="portfolio-page__earning-card">
            <span className="portfolio-page__earning-value portfolio-page__earning-value--egg">
              {FormatService.formatBigIntWithDecimals(stakingClaimed, TOKEN_DECIMALS, 4)} MOTO
            </span>
            <span className="portfolio-page__earning-label">Total MOTO claimed from $EGG staking (5% of harvests)</span>
          </div>
        </Card>
        <Card title="$EGG Emissions">
          <div className="portfolio-page__earning-card">
            <span className="portfolio-page__earning-value portfolio-page__earning-value--moto">
              {FormatService.formatBigIntWithDecimals(farmingClaimed, TOKEN_DECIMALS, 4)} EGG
            </span>
            <span className="portfolio-page__earning-label">Total $EGG claimed from $EGG-MOTO LP mining</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function YieldBreakdown({
  vaultYolks,
  eggStaked,
  lpStaked,
  pendingSizzle,
  pendingStakingRewards,
  pendingFarmEgg,
}: {
  readonly vaultYolks: bigint;
  readonly eggStaked: bigint;
  readonly lpStaked: bigint;
  readonly pendingSizzle: bigint;
  readonly pendingStakingRewards: bigint;
  readonly pendingFarmEgg: bigint;
}): React.ReactElement {
  return (
    <div className="portfolio-page__yield">
      <h2 className="portfolio-page__section-heading">Yield Breakdown</h2>
      <Card>
        <div className="portfolio-page__yield-list">
          <div className="portfolio-page__yield-row">
            <span className="portfolio-page__yield-source">Spatula Farming (The Pan)</span>
            <div className="portfolio-page__yield-details">
              <span>Yolks: {FormatService.formatBigIntWithDecimals(vaultYolks, TOKEN_DECIMALS, 4)}</span>
              <span className="portfolio-page__yield-pending">
                Pending Sizzle: {FormatService.formatBigIntWithDecimals(pendingSizzle, TOKEN_DECIMALS, 4)}
              </span>
            </div>
          </div>
          <div className="portfolio-page__yield-divider" />
          <div className="portfolio-page__yield-row">
            <span className="portfolio-page__yield-source">Yoke Tax Redistribution ($EGG Staking)</span>
            <div className="portfolio-page__yield-details">
              <span>Staked: {FormatService.formatBigIntWithDecimals(eggStaked, TOKEN_DECIMALS, 4)} EGG</span>
              <span className="portfolio-page__yield-pending">
                Pending MOTO: {FormatService.formatBigIntWithDecimals(pendingStakingRewards, TOKEN_DECIMALS, 4)} MOTO
              </span>
            </div>
          </div>
          <div className="portfolio-page__yield-divider" />
          <div className="portfolio-page__yield-row">
            <span className="portfolio-page__yield-source">$EGG Emissions ($EGG-MOTO LP Mining)</span>
            <div className="portfolio-page__yield-details">
              <span>$EGG-MOTO LP Staked: {FormatService.formatBigIntWithDecimals(lpStaked, TOKEN_DECIMALS, 4)}</span>
              <span className="portfolio-page__yield-pending">
                Pending $EGG: {FormatService.formatBigIntWithDecimals(pendingFarmEgg, TOKEN_DECIMALS, 4)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function TransactionHistory(): React.ReactElement {
  return (
    <div className="portfolio-page__history">
      <h2 className="portfolio-page__section-heading">Transaction History</h2>
      <Card>
        <div className="portfolio-page__table-wrapper">
          <table className="portfolio-page__table">
            <thead>
              <tr>
                <th className="portfolio-page__th">Type</th>
                <th className="portfolio-page__th">Amount</th>
                <th className="portfolio-page__th">Date</th>
                <th className="portfolio-page__th">TX ID</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="portfolio-page__td portfolio-page__td--empty" colSpan={4}>
                  No transactions yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PortfolioPage(): React.ReactElement {
  const { isConnected, openConnectModal } = useWallet();
  const pan = useThePan();
  const egg = useEggToken();
  const staking = useEggStaking();
  const farming = useLPMining();

  const isLoading = pan.isLoading || egg.isLoading || staking.isLoading || farming.isLoading;

  if (!isConnected) {
    return (
      <PageLayout title="Portfolio">
        <div className="portfolio-page">
          <div className="portfolio-page__connect-prompt">
            <Card title="Portfolio">
              <p className="portfolio-page__connect-text">
                Connect your wallet to view your portfolio.
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

  if (isLoading && pan.position === null && staking.position === null && farming.position === null) {
    return (
      <PageLayout title="Portfolio">
        <div className="portfolio-page">
          <div className="portfolio-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Portfolio">
      <div className="portfolio-page">
        <EarningsSummary
          vaultClaimed={0n}
          stakingClaimed={0n}
          farmingClaimed={0n}
        />
        <YieldBreakdown
          vaultYolks={pan.position?.yolks ?? 0n}
          eggStaked={staking.position?.staked ?? 0n}
          lpStaked={farming.position?.staked ?? 0n}
          pendingSizzle={pan.position?.pendingSizzle ?? 0n}
          pendingStakingRewards={staking.position?.pendingRewards ?? 0n}
          pendingFarmEgg={farming.position?.pendingEgg ?? 0n}
        />
        <TransactionHistory />
      </div>
    </PageLayout>
  );
}

export { PortfolioPage };
