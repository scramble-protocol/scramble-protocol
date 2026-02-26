import React from 'react';
import { PixelEmoji } from '../common/PixelEmoji.js';

interface YieldEngine {
  readonly icon: string;
  readonly iconVariant: 'spatula' | 'shell' | 'egg';
  readonly title: string;
  readonly duration: string;
  readonly durationVariant: 'permanent' | 'limited';
  readonly description: string;
}

const ICON_BG: Record<string, string> = {
  spatula: 'bg-primary/20',
  shell: 'bg-sizzle/20',
  egg: 'bg-egg/20',
} as const;

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
    icon: '\u{1F373}',
    iconVariant: 'shell',
    title: 'Yoke Tax',
    duration: 'Permanent',
    durationVariant: 'permanent',
    description:
      '5\u201315% additional APY from early withdrawal fees. Redistributed to remaining Shell Token holders through the Sizzle drip.',
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
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-retro text-sm text-center text-primary mb-10">Three Yield Engines</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {ENGINES.map((engine: YieldEngine): React.ReactElement => (
            <div key={engine.title} className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-6 text-center">
              <div className={`flex size-14 items-center justify-center rounded-full ${ICON_BG[engine.iconVariant]}`}>
                <PixelEmoji emoji={engine.icon} size={36} />
              </div>
              <h3 className="font-retro text-xs text-foreground">{engine.title}</h3>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  engine.durationVariant === 'permanent'
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-egg/10 text-egg border border-egg/30'
                }`}
              >
                {engine.duration}
              </span>
              <p className="text-sm text-muted-foreground">{engine.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { YieldEngines };
