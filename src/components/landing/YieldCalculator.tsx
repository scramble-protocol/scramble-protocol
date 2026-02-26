import React, { useState } from 'react';
import { cn } from '@/lib/utils.js';
import { Slider } from '@/components/ui/8bit/slider.js';
import { Switch } from '@/components/ui/8bit/switch.js';
import { Input as BitInput } from '@/components/ui/8bit/input.js';

/* ---- Whitepaper constants ---- */

interface TimePreset {
  readonly label: string;
  readonly blocks: number;
}

const TIME_PRESETS: readonly TimePreset[] = [
  { label: '7d', blocks: 1_008 },
  { label: '30d', blocks: 4_320 },
  { label: '90d', blocks: 12_960 },
  { label: '6mo', blocks: 25_920 },
  { label: '1yr', blocks: 52_560 },
] as const;

const COOK_THRESHOLDS: readonly { readonly name: string; readonly minBlocks: number; readonly multiplier: number }[] = [
  { name: 'Raw Egg', minBlocks: 0, multiplier: 1.0 },
  { name: 'Soft Boiled', minBlocks: 1_008, multiplier: 1.25 },
  { name: 'Over Easy', minBlocks: 4_320, multiplier: 1.5 },
  { name: 'Fully Scrambled', minBlocks: 12_960, multiplier: 2.0 },
] as const;

const EGG_BOOST_BONUS = 0.25;

/* Yoke Tax tiers — tax rate for withdrawal at a given block count */
const YOKE_TAX_TIERS: readonly { readonly minBlocks: number; readonly rate: number }[] = [
  { minBlocks: 25_920, rate: 0.05 },
  { minBlocks: 4_320, rate: 0.10 },
  { minBlocks: 1_008, rate: 0.20 },
  { minBlocks: 0, rate: 0.30 },
] as const;

/* $EGG emission window in blocks (~12 months) */
const EGG_EMISSION_BLOCKS = 52_560;

/* Yoke Tax redistribution midpoint APY (configurable range 5-15%) */
const YOKE_REDISTRIBUTION_APY = 0.10;

/* Blocks in a year (for annualizing) */
const BLOCKS_PER_YEAR = 52_560;

/* ---- Pure calculation helpers ---- */

function getCookLevel(blocks: number): { readonly name: string; readonly multiplier: number } {
  for (let i = COOK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (blocks >= COOK_THRESHOLDS[i].minBlocks) {
      return COOK_THRESHOLDS[i];
    }
  }
  return COOK_THRESHOLDS[0];
}

function getYokeTaxRate(blocks: number): number {
  for (const tier of YOKE_TAX_TIERS) {
    if (blocks >= tier.minBlocks) {
      return tier.rate;
    }
  }
  return 0.30;
}

function formatMoto(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/* ---- Component ---- */

function YieldCalculator(): React.ReactElement {
  const [depositStr, setDepositStr] = useState<string>('1000');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(2); // 90d default
  const [eggBoost, setEggBoost] = useState<boolean>(false);
  const [spatulaApy, setSpatulaApy] = useState<number>(5); // percent

  /* Derived values — computed inline, no useEffect */
  const deposit = Math.max(0, Number(depositStr) || 0);
  const blocks = TIME_PRESETS[selectedPresetIdx].blocks;
  const cookLevel = getCookLevel(blocks);
  const effectiveMultiplier = cookLevel.multiplier + (eggBoost ? EGG_BOOST_BONUS : 0);
  const yokeTaxRate = getYokeTaxRate(blocks);

  /* Yield calculations */
  const timeFraction = blocks / BLOCKS_PER_YEAR;

  // Spatula farming yield (base APY * time * multiplier)
  const spatulaYield = deposit * (spatulaApy / 100) * timeFraction * effectiveMultiplier;

  // Yoke Tax redistribution estimate
  const yokeRedistYield = deposit * YOKE_REDISTRIBUTION_APY * timeFraction * effectiveMultiplier;

  // $EGG emissions estimate (only if within emission window)
  const eggBlocks = Math.min(blocks, EGG_EMISSION_BLOCKS);
  const eggTimeFraction = eggBlocks / BLOCKS_PER_YEAR;
  const eggEstimate = blocks <= EGG_EMISSION_BLOCKS
    ? deposit * 0.08 * eggTimeFraction * effectiveMultiplier
    : 0;

  const totalEstimated = spatulaYield + yokeRedistYield + eggEstimate;
  const netAfterTax = totalEstimated * (1 - yokeTaxRate);

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-retro text-sm text-center text-primary mb-2">Yield Calculator</h2>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
          Estimate your returns before connecting a wallet. All numbers are
          projections based on whitepaper parameters.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ---- Inputs panel ---- */}
          <div className="flex flex-col gap-5 rounded-md border border-border bg-card p-6">
            {/* Deposit amount */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="yc-deposit">
                Deposit Amount
              </label>
              <div className="relative">
                <BitInput
                  id="yc-deposit"
                  type="text"
                  inputMode="decimal"
                  value={depositStr}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setDepositStr(e.target.value);
                  }}
                  className="pr-16"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground">
                  MOTO
                </span>
              </div>
            </div>

            {/* Time horizon */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Time Horizon</label>
              <div className="flex gap-2">
                {TIME_PRESETS.map((preset: TimePreset, idx: number): React.ReactElement => (
                  <button
                    key={preset.label}
                    type="button"
                    className={cn(
                      'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                      idx === selectedPresetIdx
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
                    )}
                    onClick={(): void => { setSelectedPresetIdx(idx); }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* $EGG Boost toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="yc-egg-boost">
                $EGG Boost (+0.25x)
              </label>
              <Switch
                id="yc-egg-boost"
                checked={eggBoost}
                onCheckedChange={(checked: boolean): void => { setEggBoost(checked); }}
              />
            </div>

            {/* Spatula APY slider */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Spatula APY Estimate: {String(spatulaApy)}%
              </label>
              <Slider
                value={[spatulaApy]}
                onValueChange={(value: number[]): void => { setSpatulaApy(value[0]); }}
                min={3}
                max={8}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3%</span>
                <span>8%</span>
              </div>
            </div>
          </div>

          {/* ---- Outputs panel ---- */}
          <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cook Level</span>
              <span className="font-medium text-foreground">{cookLevel.name}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Effective Multiplier</span>
              <span className="font-semibold text-primary">
                {effectiveMultiplier.toFixed(2)}x
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Yoke Tax at Withdrawal</span>
              <span className="font-semibold text-amber-400">
                {(yokeTaxRate * 100).toFixed(0)}%
              </span>
            </div>

            <div className="my-2 border-t border-border" />

            <h3 className="font-retro text-xs text-foreground">Yield Breakdown</h3>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spatula Farming</span>
              <span className="font-medium text-foreground">
                {formatMoto(spatulaYield)} MOTO
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Yoke Tax Redistribution</span>
              <span className="font-medium text-foreground">
                {formatMoto(yokeRedistYield)} MOTO
              </span>
            </div>

            {blocks <= EGG_EMISSION_BLOCKS && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">$EGG Emissions</span>
                <span className="font-medium text-egg">
                  {formatMoto(eggEstimate)} MOTO-equiv
                </span>
              </div>
            )}

            <div className="my-2 border-t border-border" />

            <div className="flex items-center justify-between rounded-md bg-secondary/50 p-3 text-sm">
              <span className="text-muted-foreground">Total Estimated Return</span>
              <span className="text-base font-bold text-foreground">
                {formatMoto(totalEstimated)} MOTO
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 text-sm">
              <span className="text-muted-foreground">Net After Yoke Tax</span>
              <span className="text-base font-bold text-primary">
                {formatMoto(netAfterTax)} MOTO
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground/70">
              Estimates only. Actual returns depend on pool participation, harvest
              frequency, and market conditions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { YieldCalculator };
