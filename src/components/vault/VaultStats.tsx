import type { ReactElement } from 'react';
import type { VaultStats as VaultStatsData } from '../../types/index.js';
import { Card } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/vault-stats.css';

interface VaultStatsProps {
  readonly stats: VaultStatsData | null;
  readonly isLoading: boolean;
}

function StatSkeleton(): ReactElement {
  return <div className="vault-stats__skeleton" />;
}

function VaultStatsComponent({
  stats,
  isLoading,
}: VaultStatsProps): ReactElement {
  const showSkeleton = isLoading || stats === null;

  return (
    <Card title="Vault Overview">
      <div className="vault-stats__grid">
        <div className="vault-stats__box">
          <p className="vault-stats__label">TVL</p>
          {showSkeleton ? (
            <StatSkeleton />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatTokenAmount(stats.tvl, 8)} MOTO
            </p>
          )}
        </div>

        <div className="vault-stats__box">
          <p className="vault-stats__label">Total Yolks</p>
          {showSkeleton ? (
            <StatSkeleton />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatTokenAmount(stats.totalYolks, 8)}
            </p>
          )}
        </div>

        <div className="vault-stats__box">
          <p className="vault-stats__label">Butter Level</p>
          {showSkeleton ? (
            <StatSkeleton />
          ) : (
            <p className="vault-stats__value">
              {FormatService.formatTokenAmount(stats.butterLevel, 8)}
            </p>
          )}
        </div>

        <div className="vault-stats__box">
          <p className="vault-stats__label">Sizzle Rate</p>
          {showSkeleton ? (
            <StatSkeleton />
          ) : (
            <p className="vault-stats__value vault-stats__value--sizzle">
              {FormatService.formatTokenAmount(stats.sizzleRate, 8)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export { VaultStatsComponent as VaultStats };
export type { VaultStatsProps };
