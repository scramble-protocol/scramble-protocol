import React from 'react';
import EnemyHealthDisplay from '@/components/ui/8bit/enemy-health-display.js';

interface Allocation {
  readonly name: string;
  readonly detail: string;
  readonly percentage: number;
  readonly barColor: string;
  readonly nameColor: string;
}

const ALLOCATIONS: readonly Allocation[] = [
  { name: 'Launch LP Raise', detail: '35,000,000 — LBP — 3 day event', percentage: 35, barColor: 'bg-primary', nameColor: 'text-primary' },
  { name: 'Pan Incentives', detail: '20,000,000 — ~52,560 block decay + Week 1 3x bonus', percentage: 20, barColor: 'bg-sizzle', nameColor: 'text-sizzle' },
  { name: 'Team / Dev', detail: '12,000,000 — ~25,920 block cliff, ~77,760 block vest', percentage: 12, barColor: 'bg-egg', nameColor: 'text-egg' },
  { name: 'LP Mining', detail: '10,000,000 — $EGG-MOTO liquidity rewards', percentage: 10, barColor: 'bg-moto', nameColor: 'text-moto' },
  { name: 'Protocol Liquidity', detail: '10,000,000 — Paired with MOTO, locked permanently', percentage: 10, barColor: 'bg-emerald-500', nameColor: 'text-emerald-400' },
  { name: 'Treasury', detail: '8,000,000 — Governance-controlled', percentage: 8, barColor: 'bg-violet-500', nameColor: 'text-violet-400' },
  { name: 'Free Mint', detail: '5,000,000 — 1,000 per wallet, first 5,000', percentage: 5, barColor: 'bg-rose-400', nameColor: 'text-rose-400' },
] as const;

const TOTAL_SUPPLY = '100,000,000';

function Tokenomics(): React.ReactElement {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-retro text-sm text-center text-primary mb-2">$EGG Token Distribution</h2>
        <p className="text-center text-sm text-muted-foreground mb-10">
          Total supply:{' '}
          <span className="font-semibold text-foreground">{TOTAL_SUPPLY} $EGG</span>
        </p>
        <div className="flex flex-col gap-5">
          {ALLOCATIONS.map(
            (alloc: Allocation): React.ReactElement => (
              <div key={alloc.name} className="flex flex-col gap-1">
                <EnemyHealthDisplay
                  enemyName={alloc.name}
                  currentHealth={alloc.percentage}
                  maxHealth={100}
                  showLevel={false}
                  showHealthText
                  healthBarVariant="retro"
                  healthBarColor={alloc.barColor}
                  enemyNameColor={alloc.nameColor}
                  size="sm"
                />
                <p className="text-xs text-muted-foreground/70 pl-0.5">{alloc.detail}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export { Tokenomics };
