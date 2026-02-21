import type { ReactElement } from 'react';
import { Card } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/staking-stats.css';

interface StakingStatsProps {
  readonly totalStaked: bigint;
  readonly yourShare: bigint;
  readonly totalSupply: bigint;
  readonly isLoading: boolean;
}

function StatSkeleton(): ReactElement {
  return <div className="staking-stats__skeleton" />;
}

function formatSharePercent(share: bigint, supply: bigint): string {
  if (supply === 0n) {
    return '0.00%';
  }
  const basisPoints = (share * 10000n) / supply;
  const whole = basisPoints / 100n;
  const fractional = basisPoints % 100n;
  const fractionalStr = fractional.toString().padStart(2, '0');
  return `${whole.toString()}.${fractionalStr}%`;
}

function StakingStatsComponent({
  totalStaked,
  yourShare,
  totalSupply,
  isLoading,
}: StakingStatsProps): ReactElement {
  const sharePercent = formatSharePercent(yourShare, totalSupply);

  return (
    <Card title="Staking Overview" subtitle="Stake $EGG to earn 5% of all Spatula harvests. Rewards are paid in MOTO — real yield from real protocol activity.">
      <div className="staking-stats__grid">
        <div className="staking-stats__box">
          <p className="staking-stats__label">Total Staked $EGG</p>
          {isLoading ? (
            <StatSkeleton />
          ) : (
            <p className="staking-stats__value staking-stats__value--egg">
              {FormatService.formatTokenAmount(totalStaked, 8)}
            </p>
          )}
        </div>

        <div className="staking-stats__box">
          <p className="staking-stats__label">Your Share</p>
          {isLoading ? (
            <StatSkeleton />
          ) : (
            <p className="staking-stats__value">
              {sharePercent}
            </p>
          )}
        </div>

        <div className="staking-stats__box">
          <p className="staking-stats__label">APR Estimate</p>
          {isLoading ? (
            <StatSkeleton />
          ) : (
            <p className="staking-stats__value staking-stats__value--accent">
              --
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export { StakingStatsComponent as StakingStats };
export type { StakingStatsProps };
