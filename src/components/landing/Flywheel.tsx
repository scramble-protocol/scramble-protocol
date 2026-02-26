import React from 'react';
import { PixelEmoji } from '../common/PixelEmoji.js';

interface FlywheelNode {
  readonly icon: string;
  readonly label: string;
}

const NODES: readonly FlywheelNode[] = [
  { icon: '\u{1F4B0}', label: 'Deposit MOTO into The Pan' },
  { icon: '\u{1F944}', label: 'Spatula farms MotoChef yield' },
  { icon: '\u{1F525}', label: 'Yield + Yoke Tax enter Sizzle drip' },
  { icon: '\u{1F4C8}', label: 'High APY attracts new deposits' },
  { icon: '\u{23F3}', label: 'Cook Level keeps users staked longer' },
  { icon: '\u{2B06}\uFE0F', label: 'Bigger Pan = more Spatula yield' },
] as const;

function Flywheel(): React.ReactElement {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-retro text-sm text-center text-primary mb-10">The Scramble Flywheel</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {NODES.map(
            (node: FlywheelNode, index: number): React.ReactElement => (
              <React.Fragment key={node.label}>
                <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-card px-4 py-5 text-center w-36">
                  <PixelEmoji emoji={node.icon} size={36} />
                  <p className="text-xs text-muted-foreground leading-relaxed">{node.label}</p>
                </div>
                {index < NODES.length - 1 && (
                  <span className="text-muted-foreground text-lg hidden sm:block" aria-hidden="true">
                    &rarr;
                  </span>
                )}
              </React.Fragment>
            ),
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 text-muted-foreground">
          <PixelEmoji emoji="&#x21BB;" size={24} />
          <p className="text-sm">
            More yield means more Sizzle. The cycle repeats.
          </p>
        </div>
      </div>
    </section>
  );
}

export { Flywheel };
