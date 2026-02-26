import React from 'react';
import { Link } from 'react-router-dom';
import { Button as BitButton } from '@/components/ui/8bit/button.js';

interface HeroProps {
  readonly parallaxRef?: React.RefObject<HTMLElement | null>;
}

function Hero({ parallaxRef }: HeroProps): React.ReactElement {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-background px-4"
      ref={parallaxRef}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />

      {/* Pixel spatula background */}
      <img
        src="/spatula.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.07]"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="font-retro text-xl leading-relaxed text-primary sm:text-2xl md:text-3xl">
          Get Cracked. Get Cooked. Get Scrambled.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          A DeFi yield game on Bitcoin. The longer you stay, the more you earn.
          Deposit MOTO into The Pan, earn from three yield engines, and watch
          your position sizzle.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <BitButton variant="default" size="lg" asChild>
            <Link to="/vault">Start Cooking</Link>
          </BitButton>
          <BitButton variant="outline" size="lg" asChild>
            <Link to="/mint">Free Mint</Link>
          </BitButton>
        </div>
      </div>
    </section>
  );
}

export { Hero };
