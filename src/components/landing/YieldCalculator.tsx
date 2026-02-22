import React, { useState } from 'react';
import '../../styles/components/yield-calculator.css';

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
    <section className="yield-calc">
      <div className="yield-calc__inner">
        <h2 className="yield-calc__heading">Yield Calculator</h2>
        <p className="yield-calc__subtitle">
          Estimate your returns before connecting a wallet. All numbers are
          projections based on whitepaper parameters.
        </p>

        <div className="yield-calc__grid">
          {/* ---- Inputs panel ---- */}
          <div className="yield-calc__inputs">
            {/* Deposit amount */}
            <div className="yield-calc__field">
              <label className="yield-calc__label" htmlFor="yc-deposit">
                Deposit Amount
              </label>
              <div className="yield-calc__input-wrap">
                <input
                  id="yc-deposit"
                  className="yield-calc__input"
                  type="text"
                  inputMode="decimal"
                  value={depositStr}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                    setDepositStr(e.target.value);
                  }}
                />
                <span className="yield-calc__suffix">MOTO</span>
              </div>
            </div>

            {/* Time horizon */}
            <div className="yield-calc__field">
              <label className="yield-calc__label">Time Horizon</label>
              <div className="yield-calc__presets">
                {TIME_PRESETS.map((preset: TimePreset, idx: number): React.ReactElement => (
                  <button
                    key={preset.label}
                    type="button"
                    className={`yield-calc__preset${idx === selectedPresetIdx ? ' yield-calc__preset--active' : ''}`}
                    onClick={(): void => { setSelectedPresetIdx(idx); }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* $EGG Boost toggle */}
            <div className="yield-calc__field yield-calc__field--row">
              <label className="yield-calc__label" htmlFor="yc-egg-boost">
                $EGG Boost (+0.25x)
              </label>
              <button
                id="yc-egg-boost"
                type="button"
                role="switch"
                aria-checked={eggBoost}
                className={`yield-calc__toggle${eggBoost ? ' yield-calc__toggle--on' : ''}`}
                onClick={(): void => { setEggBoost((prev: boolean): boolean => !prev); }}
              >
                <span className="yield-calc__toggle-thumb" />
              </button>
            </div>

            {/* Spatula APY slider */}
            <div className="yield-calc__field">
              <label className="yield-calc__label" htmlFor="yc-spatula-apy">
                Spatula APY Estimate: {String(spatulaApy)}%
              </label>
              <input
                id="yc-spatula-apy"
                className="yield-calc__slider"
                type="range"
                min={3}
                max={8}
                step={0.5}
                value={spatulaApy}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setSpatulaApy(Number(e.target.value));
                }}
              />
              <div className="yield-calc__slider-labels">
                <span>3%</span>
                <span>8%</span>
              </div>
            </div>
          </div>

          {/* ---- Outputs panel ---- */}
          <div className="yield-calc__outputs">
            <div className="yield-calc__result">
              <span className="yield-calc__result-label">Cook Level</span>
              <span className="yield-calc__result-value">{cookLevel.name}</span>
            </div>

            <div className="yield-calc__result">
              <span className="yield-calc__result-label">Effective Multiplier</span>
              <span className="yield-calc__result-value yield-calc__result-value--accent">
                {effectiveMultiplier.toFixed(2)}x
              </span>
            </div>

            <div className="yield-calc__result">
              <span className="yield-calc__result-label">Yoke Tax at Withdrawal</span>
              <span className="yield-calc__result-value yield-calc__result-value--warning">
                {(yokeTaxRate * 100).toFixed(0)}%
              </span>
            </div>

            <div className="yield-calc__divider" />

            <h3 className="yield-calc__breakdown-heading">Yield Breakdown</h3>

            <div className="yield-calc__result">
              <span className="yield-calc__result-label">Spatula Farming</span>
              <span className="yield-calc__result-value">
                {formatMoto(spatulaYield)} MOTO
              </span>
            </div>

            <div className="yield-calc__result">
              <span className="yield-calc__result-label">Yoke Tax Redistribution</span>
              <span className="yield-calc__result-value">
                {formatMoto(yokeRedistYield)} MOTO
              </span>
            </div>

            {blocks <= EGG_EMISSION_BLOCKS && (
              <div className="yield-calc__result">
                <span className="yield-calc__result-label">$EGG Emissions</span>
                <span className="yield-calc__result-value yield-calc__result-value--egg">
                  {formatMoto(eggEstimate)} MOTO-equiv
                </span>
              </div>
            )}

            <div className="yield-calc__divider" />

            <div className="yield-calc__result yield-calc__result--highlight">
              <span className="yield-calc__result-label">Total Estimated Return</span>
              <span className="yield-calc__result-value yield-calc__result-value--large">
                {formatMoto(totalEstimated)} MOTO
              </span>
            </div>

            <div className="yield-calc__result yield-calc__result--final">
              <span className="yield-calc__result-label">Net After Yoke Tax</span>
              <span className="yield-calc__result-value yield-calc__result-value--large yield-calc__result-value--accent">
                {formatMoto(netAfterTax)} MOTO
              </span>
            </div>

            <p className="yield-calc__disclaimer">
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
