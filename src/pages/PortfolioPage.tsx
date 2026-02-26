import React from 'react';
import { PageLayout } from '../components/layout/index.js';
import { useWallet, useThePan, useEggToken, useEggStaking, useLPMining } from '../hooks/index.js';
import { Card, Button, Spinner } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

const TOKEN_DECIMALS = 18;

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
    <div className="flex flex-col gap-4">
      <h2 className="font-retro text-xs text-foreground">Earnings Summary</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Spatula Farming">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-lg font-bold text-foreground">
              {FormatService.formatBigIntWithDecimals(vaultClaimed, TOKEN_DECIMALS, 4)} MOTO
            </span>
            <span className="text-xs text-muted-foreground">Total Sizzle claimed from The Pan</span>
          </div>
        </Card>
        <Card title="Yoke Tax Redistribution">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-lg font-bold text-egg">
              {FormatService.formatBigIntWithDecimals(stakingClaimed, TOKEN_DECIMALS, 4)} MOTO
            </span>
            <span className="text-xs text-muted-foreground">Total MOTO claimed from $EGG staking (5% of harvests)</span>
          </div>
        </Card>
        <Card title="$EGG Emissions">
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-lg font-bold text-moto">
              {FormatService.formatBigIntWithDecimals(farmingClaimed, TOKEN_DECIMALS, 4)} EGG
            </span>
            <span className="text-xs text-muted-foreground">Total $EGG claimed from $EGG-MOTO LP mining</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function YieldBreakdown({
  vaultShells,
  eggStaked,
  lpStaked,
  pendingSizzle,
  pendingStakingRewards,
  pendingFarmEgg,
}: {
  readonly vaultShells: bigint;
  readonly eggStaked: bigint;
  readonly lpStaked: bigint;
  readonly pendingSizzle: bigint;
  readonly pendingStakingRewards: bigint;
  readonly pendingFarmEgg: bigint;
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-retro text-xs text-foreground">Yield Breakdown</h2>
      <Card>
        <div className="flex flex-col divide-y divide-border">
          <div className="flex items-center justify-between py-3 first:pt-0">
            <span className="text-sm text-muted-foreground">Spatula Farming (The Pan)</span>
            <div className="flex flex-col items-end gap-0.5 text-xs">
              <span>Shell Token: {FormatService.formatBigIntWithDecimals(vaultShells, TOKEN_DECIMALS, 4)}</span>
              <span className="text-sizzle">
                Pending Sizzle: {FormatService.formatBigIntWithDecimals(pendingSizzle, TOKEN_DECIMALS, 4)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-muted-foreground">Yoke Tax Redistribution ($EGG Staking)</span>
            <div className="flex flex-col items-end gap-0.5 text-xs">
              <span>Staked: {FormatService.formatBigIntWithDecimals(eggStaked, TOKEN_DECIMALS, 4)} EGG</span>
              <span className="text-sizzle">
                Pending MOTO: {FormatService.formatBigIntWithDecimals(pendingStakingRewards, TOKEN_DECIMALS, 4)} MOTO
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-sm text-muted-foreground">$EGG Emissions ($EGG-MOTO LP Mining)</span>
            <div className="flex flex-col items-end gap-0.5 text-xs">
              <span>$EGG-MOTO LP Staked: {FormatService.formatBigIntWithDecimals(lpStaked, TOKEN_DECIMALS, 4)}</span>
              <span className="text-egg">
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
    <div className="flex flex-col gap-4">
      <h2 className="font-retro text-xs text-foreground">Transaction History</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">TX ID</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 text-center text-muted-foreground" colSpan={4}>
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
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="Portfolio">
              <p className="mb-4 text-sm text-muted-foreground">
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Portfolio">
      <div className="flex flex-col gap-8">
        <EarningsSummary
          vaultClaimed={0n}
          stakingClaimed={0n}
          farmingClaimed={0n}
        />
        <YieldBreakdown
          vaultShells={pan.position?.shells ?? 0n}
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
