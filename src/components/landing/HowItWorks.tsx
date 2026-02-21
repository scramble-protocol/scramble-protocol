import React from 'react';
import '../../styles/components/how-it-works.css';

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const STEPS: readonly Step[] = [
  {
    icon: '\u{1F373}',
    title: 'Drop It In',
    description:
      'Deposit MOTO into The Pan. You receive Yolks \u2014 your proportional share of the vault.',
  },
  {
    icon: '\u{1F525}',
    title: 'Let It Cook',
    description:
      'The longer you stay, the lower your Yoke Tax. Your Cook Level rises from Raw Egg to Fully Scrambled, boosting rewards up to 2x.',
  },
  {
    icon: '\u{1F37D}\uFE0F',
    title: 'Get Your Plate',
    description:
      'Withdraw your MOTO plus earned Sizzle rewards. Three yield engines work for you: Spatula farming, Yoke Tax redistribution, and $EGG emissions.',
  },
] as const;

function HowItWorks(): React.ReactElement {
  return (
    <section className="how-it-works">
      <div className="how-it-works__inner">
        <h2 className="how-it-works__heading">How It Works</h2>
        <div className="how-it-works__cards">
          {STEPS.map((step: Step): React.ReactElement => (
            <div key={step.title} className="how-it-works__card">
              <span className="how-it-works__icon" aria-hidden="true">
                {step.icon}
              </span>
              <h3 className="how-it-works__card-title">{step.title}</h3>
              <p className="how-it-works__card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
