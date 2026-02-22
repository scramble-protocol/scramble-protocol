import React, { useRef } from 'react';
import { Hero } from '../components/landing/Hero.js';
import { HowItWorks } from '../components/landing/HowItWorks.js';
import { YokeTaxTiers } from '../components/landing/YokeTaxTiers.js';
import { YieldEngines } from '../components/landing/YieldEngines.js';
import { YieldCalculator } from '../components/landing/YieldCalculator.js';
import { CookLevels } from '../components/landing/CookLevels.js';
import { Tokenomics } from '../components/landing/Tokenomics.js';
import { Flywheel } from '../components/landing/Flywheel.js';
import { CTA } from '../components/landing/CTA.js';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import { useHeroParallax, useScrollReveal } from '../hooks/index.js';
import '../styles/components/landing-page.css';

function LandingPage(): React.ReactElement {
  const sectionsRef = useRef<HTMLDivElement>(null);
  const heroRef = useHeroParallax();

  useScrollReveal(sectionsRef);

  return (
    <div className="landing-page">
      <Header />
      <main className="landing-page__main">
        <Hero parallaxRef={heroRef} />
        <div ref={sectionsRef} className="landing-page__sections">
          <div className="scroll-reveal">
            <HowItWorks />
          </div>
          <div className="scroll-reveal">
            <YokeTaxTiers />
          </div>
          <div className="scroll-reveal">
            <YieldEngines />
          </div>
          <div className="scroll-reveal">
            <YieldCalculator />
          </div>
          <div className="scroll-reveal">
            <CookLevels />
          </div>
          <div className="scroll-reveal">
            <Tokenomics />
          </div>
          <div className="scroll-reveal">
            <Flywheel />
          </div>
          <div className="scroll-reveal">
            <CTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { LandingPage };
