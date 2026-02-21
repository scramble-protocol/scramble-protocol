import type { ReactElement } from 'react';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/balance-overview.css';

interface BalanceOverviewProps {
  readonly motoBalance: bigint;
  readonly eggBalance: bigint;
  readonly shellBalance: bigint;
  readonly lpBalance: bigint;
  readonly isLoading: boolean;
}

interface BalanceItem {
  readonly label: string;
  readonly value: bigint;
  readonly variant: string;
}

function BalanceOverview({
  motoBalance,
  eggBalance,
  shellBalance,
  lpBalance,
  isLoading,
}: BalanceOverviewProps): ReactElement {
  const balances: ReadonlyArray<BalanceItem> = [
    { label: 'MOTO', value: motoBalance, variant: 'moto' },
    { label: '$EGG', value: eggBalance, variant: 'egg' },
    { label: 'Shell Token', value: shellBalance, variant: 'butter' },
    { label: '$EGG-MOTO LP', value: lpBalance, variant: 'accent' },
  ];

  return (
    <div className="balance-overview">
      {balances.map(function (item: BalanceItem): ReactElement {
        return (
          <div key={item.label} className="balance-overview__card">
            <p className="balance-overview__card-label">{item.label}</p>
            {isLoading ? (
              <div className="balance-overview__skeleton" />
            ) : (
              <p
                className={`balance-overview__card-value balance-overview__card-value--${item.variant}`}
              >
                {FormatService.formatBigIntWithDecimals(item.value, 8, 4)}
              </p>
            )}
            <div
              className={`balance-overview__accent-bar balance-overview__accent-bar--${item.variant}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export { BalanceOverview };
export type { BalanceOverviewProps };
