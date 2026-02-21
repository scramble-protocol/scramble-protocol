import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/cta.css';

interface CTAProps {
  readonly onConnect?: () => void;
}

interface SocialLink {
  readonly label: string;
  readonly href: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Twitter', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Docs', href: '#' },
] as const;

function CTA({ onConnect }: CTAProps): React.ReactElement {
  function handleClick(): void {
    if (onConnect) {
      onConnect();
    }
  }

  const hasConnectHandler = typeof onConnect === 'function';

  return (
    <section className="cta-section">
      <div className="cta-section__inner">
        <h2 className="cta-section__heading">Get in the Pan. Stay crunchy.</h2>

        {hasConnectHandler ? (
          <button
            type="button"
            className="cta-section__button"
            onClick={handleClick}
          >
            Connect Wallet
          </button>
        ) : (
          <Link to="/vault" className="cta-section__button">
            Connect Wallet
          </Link>
        )}

        <nav className="cta-section__socials" aria-label="Social links">
          {SOCIAL_LINKS.map(
            (link: SocialLink): React.ReactElement => (
              <a
                key={link.label}
                href={link.href}
                className="cta-section__social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="cta-section__footer">
          <p className="cta-section__brand">
            scramble.finance &mdash; DeFi yield on Bitcoin
          </p>
          <p className="cta-section__disclaimer">
            This protocol is experimental. Participation carries risk. Do your
            own research before depositing funds.
          </p>
        </div>
      </div>
    </section>
  );
}

export { CTA };
