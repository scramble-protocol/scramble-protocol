import React from 'react';
import '../../styles/components/cook-levels.css';

interface CookLevel {
  readonly level: number;
  readonly name: string;
  readonly multiplier: string;
  readonly blocks: string;
  readonly glow: boolean;
}

const LEVELS: readonly CookLevel[] = [
  { level: 1, name: 'Raw Egg', multiplier: '1.00x', blocks: '0\u20131,008 (~0\u20137 days)', glow: false },
  { level: 2, name: 'Soft Boiled', multiplier: '1.25x', blocks: '1,008\u20134,320 (~7\u201330 days)', glow: false },
  { level: 3, name: 'Over Easy', multiplier: '1.50x', blocks: '4,320\u201312,960 (~30\u201390 days)', glow: false },
  { level: 4, name: 'Fully Scrambled', multiplier: '2.00x', blocks: '12,960+ (~90+ days)', glow: true },
] as const;

const ARROW_POSITIONS: readonly number[] = [1, 2, 3] as const;

function CookLevels(): React.ReactElement {
  return (
    <section className="cook-levels">
      <div className="cook-levels__inner">
        <h2 className="cook-levels__heading">
          Cook Levels &mdash; The Longer, The Better
        </h2>
        <div className="cook-levels__track">
          {ARROW_POSITIONS.map((pos: number): React.ReactElement => (
            <span
              key={`arrow-${String(pos)}`}
              className={`cook-levels__arrow cook-levels__arrow--${String(pos)}`}
              aria-hidden="true"
            >
              &rarr;
            </span>
          ))}
          {LEVELS.map((lv: CookLevel): React.ReactElement => (
            <div
              key={lv.name}
              className={`cook-levels__card${lv.glow ? ' cook-levels__card--glow' : ''}`}
            >
              <p className="cook-levels__level">Level {String(lv.level)}</p>
              <p className="cook-levels__name">{lv.name}</p>
              <p className="cook-levels__multiplier">{lv.multiplier}</p>
              <p className="cook-levels__blocks">{lv.blocks}</p>
            </div>
          ))}
        </div>
        <p className="cook-levels__note">
          Withdrawing resets Cook Level. $EGG boost adds +0.25x. Week 1 bonus
          adds 3x on top.
        </p>
      </div>
    </section>
  );
}

export { CookLevels };
