import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/hero.css';

function Hero(): React.ReactElement {
  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__content">
        <h1 className="hero__heading">Get Cracked. Get Cooked. Get Scrambled.</h1>
        <p className="hero__subtext">
          A DeFi yield game on Bitcoin. The longer you stay, the more you earn.
          Deposit MOTO into The Pan, earn from three yield engines, and watch
          your position sizzle.
        </p>
        <div className="hero__cta-row">
          <Link to="/vault" className="hero__cta hero__cta--primary">
            Launch App
          </Link>
          <Link to="/mint" className="hero__cta hero__cta--secondary">
            Free Mint
          </Link>
        </div>
      </div>
    </section>
  );
}

export { Hero };
