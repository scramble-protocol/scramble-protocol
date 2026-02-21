import type { ReactElement } from 'react';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/protocol-stats.css';

interface ProtocolStatsProps {
  readonly tvl: bigint;
  readonly totalStaked: bigint;
  readonly totalFarmed: bigint;
  readonly isLoading: boolean;
}

interface StatItem {
  readonly label: string;
  readonly value: bigint;
}

function ProtocolStats({
  tvl,
  totalStaked,
  totalFarmed,
  isLoading,
}: ProtocolStatsProps): ReactElement {
  const stats: ReadonlyArray<StatItem> = [
    { label: 'Total Value Locked', value: tvl },
    { label: 'Total $EGG Staked', value: totalStaked },
    { label: 'Total $EGG-MOTO LP Staked', value: totalFarmed },
  ];

  return (
    <div className="protocol-stats">
      {stats.map(function (stat: StatItem): ReactElement {
        return (
          <div key={stat.label} className="protocol-stats__box">
            <p className="protocol-stats__box-label">{stat.label}</p>
            {isLoading ? (
              <div className="protocol-stats__skeleton" />
            ) : (
              <p className="protocol-stats__box-value">
                {FormatService.formatBigIntWithDecimals(stat.value, 8, 4)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { ProtocolStats };
export type { ProtocolStatsProps };
