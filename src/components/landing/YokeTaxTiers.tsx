import React from 'react';
import { PixelEmoji } from '../common/PixelEmoji.js';

interface TaxTier {
  readonly rate: string;
  readonly blocks: string;
  readonly severity: 'high' | 'medium-high' | 'medium' | 'low';
  readonly emoji: string;
}

const RATE_COLORS: Record<string, string> = {
  high: 'text-red-400',
  'medium-high': 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
} as const;

const TIERS: readonly TaxTier[] = [
  { rate: '30%', blocks: 'Cracked: Under 1,008 blocks (~7 days)', severity: 'high', emoji: '\u{1F95A}' },
  { rate: '20%', blocks: 'Runny: 1,008\u20134,320 blocks (~7\u201330 days)', severity: 'medium-high', emoji: '\u{1FAE0}' },
  { rate: '10%', blocks: 'Scrambled: 4,320\u201325,920 blocks (~30 days\u20136 months)', severity: 'medium', emoji: '\u{1F373}' },
  { rate: '5%', blocks: 'Golden Egg: 25,920+ blocks (~6+ months)', severity: 'low', emoji: '\u{1F31F}' },
] as const;

function YokeTaxTiers(): React.ReactElement {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-retro text-sm text-center text-primary mb-4">
          Yoke Tax &mdash; Patience Pays
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
          Early withdrawal means higher tax. The Yoke Tax is redistributed to
          loyal depositors through the Sizzle drip. The Golden Egg tier gives
          long-term holders a near-clean exit.
        </p>
        <div className="flex flex-col gap-4">
          {TIERS.map((tier: TaxTier): React.ReactElement => (
            <div key={tier.rate} className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
              <PixelEmoji emoji={tier.emoji} size={32} />
              <div className="flex flex-col gap-1">
                <p className={`font-retro text-xs ${RATE_COLORS[tier.severity]}`}>
                  {tier.rate}
                </p>
                <p className="text-sm text-muted-foreground">{tier.blocks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { YokeTaxTiers };
