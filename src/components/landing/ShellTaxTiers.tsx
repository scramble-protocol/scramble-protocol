import React from 'react';
import '../../styles/components/shell-tax-tiers.css';

interface TaxTier {
  readonly rate: string;
  readonly blocks: string;
  readonly severity: 'high' | 'medium-high' | 'medium' | 'low';
}

const TIERS: readonly TaxTier[] = [
  { rate: '30%', blocks: 'Cracked: Under 1,008 blocks (~7 days)', severity: 'high' },
  { rate: '20%', blocks: 'Runny: 1,008\u20134,320 blocks (~7\u201330 days)', severity: 'medium-high' },
  { rate: '10%', blocks: 'Scrambled: 4,320\u201325,920 blocks (~30 days\u20136 months)', severity: 'medium' },
  { rate: '5%', blocks: 'Golden Egg: 25,920+ blocks (~6+ months)', severity: 'low' },
] as const;

function ShellTaxTiers(): React.ReactElement {
  return (
    <section className="shell-tax">
      <div className="shell-tax__inner">
        <h2 className="shell-tax__heading">Shell Tax &mdash; Patience Pays</h2>
        <p className="shell-tax__explanation">
          Early withdrawal means higher tax. The Shell Tax is redistributed to
          loyal depositors through the Sizzle drip. The Golden Egg tier gives
          long-term holders a near-clean exit.
        </p>
        <div className="shell-tax__timeline">
          {TIERS.map((tier: TaxTier): React.ReactElement => (
            <div key={tier.rate} className="shell-tax__tier">
              <div
                className={`shell-tax__dot shell-tax__dot--${tier.severity}`}
                aria-hidden="true"
              />
              <div className="shell-tax__tier-info">
                <p
                  className={`shell-tax__tier-rate shell-tax__tier-rate--${tier.severity}`}
                >
                  {tier.rate}
                </p>
                <p className="shell-tax__tier-blocks">{tier.blocks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { ShellTaxTiers };
