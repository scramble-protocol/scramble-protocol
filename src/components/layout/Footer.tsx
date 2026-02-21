import type { ReactElement } from 'react';
import { useNetwork } from '../../hooks/useNetwork.js';
import '../../styles/components/footer.css';

interface FooterLink {
  readonly label: string;
  readonly href: string;
}

const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'Twitter', href: '#' },
] as const;

function Footer(): ReactElement {
  const { network } = useNetwork();

  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Column 1: Branding */}
        <div>
          <div className="footer__brand-name">Scramble Protocol</div>
          <p className="footer__tagline">DeFi yield on Bitcoin L1</p>
        </div>

        {/* Column 2: Links */}
        <div>
          <div className="footer__heading">Links</div>
          <div className="footer__links">
            {FOOTER_LINKS.map(
              (link: FooterLink): ReactElement => (
                <a
                  key={link.label}
                  href={link.href}
                  className="footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>
        </div>

        {/* Column 3: Network */}
        <div>
          <div className="footer__heading">Network</div>
          <div className="footer__network-badge">
            <span className="footer__network-dot" />
            <span>{network}</span>
          </div>
          <p className="footer__disclaimer">
            Scramble Protocol is experimental software. Use at your own risk.
            Smart contracts are unaudited.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          &copy; {currentYear} Scramble Protocol. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
