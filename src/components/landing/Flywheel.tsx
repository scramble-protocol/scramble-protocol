import React from 'react';
import '../../styles/components/flywheel.css';

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
    <section className="flywheel">
      <div className="flywheel__inner">
        <h2 className="flywheel__heading">The Scramble Flywheel</h2>
        <div className="flywheel__flow">
          {NODES.map(
            (node: FlywheelNode, index: number): React.ReactElement => (
              <React.Fragment key={node.label}>
                <div className="flywheel__node">
                  <span className="flywheel__node-icon" aria-hidden="true">
                    {node.icon}
                  </span>
                  <p className="flywheel__node-label">{node.label}</p>
                </div>
                {index < NODES.length - 1 && (
                  <span className="flywheel__arrow" aria-hidden="true">
                    &rarr;
                  </span>
                )}
              </React.Fragment>
            ),
          )}
        </div>
        <div className="flywheel__repeat">
          <span className="flywheel__repeat-icon" aria-hidden="true">
            &#x21BB;
          </span>
          <p className="flywheel__repeat-text">
            More yield means more Sizzle. The cycle repeats.
          </p>
        </div>
      </div>
    </section>
  );
}

export { Flywheel };
