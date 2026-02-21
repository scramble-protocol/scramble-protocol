import React, { useRef } from 'react';
import { Hero } from '../components/landing/Hero.js';
import { HowItWorks } from '../components/landing/HowItWorks.js';
import { ShellTaxTiers } from '../components/landing/ShellTaxTiers.js';
import { YieldEngines } from '../components/landing/YieldEngines.js';
import { CookLevels } from '../components/landing/CookLevels.js';
import { Tokenomics } from '../components/landing/Tokenomics.js';
import { Flywheel } from '../components/landing/Flywheel.js';
import { CTA } from '../components/landing/CTA.js';
import { Header } from '../components/layout/Header.js';
import { Footer } from '../components/layout/Footer.js';
import '../styles/components/landing-page.css';

function LandingPage(): React.ReactElement {
  const sectionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="landing-page">
      <Header />
      <main className="landing-page__main">
        <Hero />
        <div ref={sectionsRef} className="landing-page__sections">
          <HowItWorks />
          <ShellTaxTiers />
          <YieldEngines />
          <CookLevels />
          <Tokenomics />
          <Flywheel />
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { LandingPage };
