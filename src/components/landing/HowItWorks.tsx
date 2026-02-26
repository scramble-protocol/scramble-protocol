import React from 'react';

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const STEPS: readonly Step[] = [
  {
    icon: '1',
    title: 'Drop It In',
    description:
      'Deposit MOTO into The Pan. You receive Shell Token — your proportional share of the vault.',
  },
  {
    icon: '2',
    title: 'Let It Cook',
    description:
      'The longer you stay, the lower your Yoke Tax. Your Cook Level rises from Raw Egg to Fully Scrambled, boosting rewards up to 2x.',
  },
  {
    icon: '3',
    title: 'Get Your Plate',
    description:
      'Withdraw your MOTO plus earned Sizzle rewards. Three yield engines work for you: Spatula farming, Yoke Tax redistribution, and $EGG emissions.',
  },
] as const;

function HowItWorks(): React.ReactElement {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-retro text-sm text-center text-primary mb-10">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step: Step): React.ReactElement => (
            <div key={step.title} className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-primary font-retro text-xs text-primary" aria-hidden="true">
                {step.icon}
              </span>
              <h3 className="font-retro text-xs text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
