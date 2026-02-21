import React from 'react';
import '../../styles/components/yield-engines.css';

interface YieldEngine {
  readonly icon: string;
  readonly iconVariant: string;
  readonly title: string;
  readonly duration: string;
  readonly durationVariant: 'permanent' | 'limited';
  readonly description: string;
}

const ENGINES: readonly YieldEngine[] = [
  {
    icon: '\u{1F944}',
    iconVariant: 'spatula',
    title: 'The Spatula',
    duration: 'Permanent',
    durationVariant: 'permanent',
    description:
      'MotoChef farming yield (3\u20138% baseline APY), auto-compounded via harvest bounties. Runs forever.',
  },
  {
    icon: '\u{1F41A}',
    iconVariant: 'shell',
    title: 'Yoke Tax',
    duration: 'Permanent',
    durationVariant: 'permanent',
    description:
      '5\u201315% additional APY from early withdrawal fees. Redistributed to remaining Yolk holders through the Sizzle drip.',
  },
  {
    icon: '\u{1F95A}',
    iconVariant: 'egg',
    title: '$EGG Emissions',
    duration: '~52,560 blocks (~12 Months)',
    durationVariant: 'limited',
    description:
      'Rocket fuel for launch. 3x bonus in the first ~1,008 blocks. Monthly decay curve. Designed to be temporary.',
  },
] as const;

function YieldEngines(): React.ReactElement {
  return (
    <section className="yield-engines">
      <div className="yield-engines__inner">
        <h2 className="yield-engines__heading">Three Yield Engines</h2>
        <div className="yield-engines__grid">
          {ENGINES.map((engine: YieldEngine): React.ReactElement => (
            <div key={engine.title} className="yield-engines__card">
              <div
                className={`yield-engines__icon yield-engines__icon--${engine.iconVariant}`}
                aria-hidden="true"
              >
                {engine.icon}
              </div>
              <h3 className="yield-engines__title">{engine.title}</h3>
              <span
                className={`yield-engines__badge yield-engines__badge--${engine.durationVariant}`}
              >
                {engine.duration}
              </span>
              <p className="yield-engines__desc">{engine.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { YieldEngines };
