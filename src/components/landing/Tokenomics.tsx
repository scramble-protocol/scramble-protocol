import React from 'react';
import '../../styles/components/tokenomics.css';

interface Allocation {
  readonly label: string;
  readonly percentage: number;
  readonly variant: string;
}

const ALLOCATIONS: readonly Allocation[] = [
  { label: 'Launch LP Raise (35,000,000) \u2014 LBP \u2014 3 day event', percentage: 35, variant: 'vault' },
  { label: 'Pan Incentives (20,000,000) \u2014 ~52,560 block decay + Week 1 3x bonus', percentage: 20, variant: 'lp' },
  { label: 'Team / Development (12,000,000) \u2014 ~25,920 block cliff, ~77,760 block vest', percentage: 12, variant: 'mint' },
  { label: 'LP Mining (10,000,000) \u2014 $EGG-MOTO liquidity rewards', percentage: 10, variant: 'staking' },
  { label: 'Protocol-Owned Liquidity (10,000,000) \u2014 Paired with MOTO, locked permanently', percentage: 10, variant: 'reserve' },
  { label: 'Treasury (8,000,000) \u2014 Governance-controlled', percentage: 8, variant: 'vault' },
  { label: 'Free Mint (5,000,000) \u2014 1,000 per wallet, first 5,000', percentage: 5, variant: 'mint' },
] as const;

const TOTAL_SUPPLY = '100,000,000';

function Tokenomics(): React.ReactElement {
  return (
    <section className="tokenomics">
      <div className="tokenomics__inner">
        <h2 className="tokenomics__heading">$EGG Token Distribution</h2>
        <p className="tokenomics__supply">
          Total supply:{' '}
          <span className="tokenomics__supply-value">
            {TOTAL_SUPPLY} $EGG
          </span>
        </p>
        <div className="tokenomics__allocations">
          {ALLOCATIONS.map(
            (alloc: Allocation): React.ReactElement => (
              <div key={alloc.label} className="tokenomics__row">
                <div className="tokenomics__row-header">
                  <p className="tokenomics__label">{alloc.label}</p>
                  <p
                    className={`tokenomics__percentage tokenomics__percentage--${alloc.variant}`}
                  >
                    {String(alloc.percentage)}%
                  </p>
                </div>
                <div className="tokenomics__bar-track">
                  <div
                    className={`tokenomics__bar-fill tokenomics__bar-fill--${alloc.variant}`}
                    style={{ width: `${String(alloc.percentage)}%` }}
                    role="meter"
                    aria-valuenow={alloc.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${alloc.label}: ${String(alloc.percentage)}%`}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export { Tokenomics };
