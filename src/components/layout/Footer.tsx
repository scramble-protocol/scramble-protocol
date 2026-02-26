import type { ReactElement } from 'react';
import { useNetwork } from '../../hooks/useNetwork.js';

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
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Branding */}
          <div>
            <div className="font-retro text-xs text-primary">Scramble Protocol</div>
            <p className="mt-2 text-sm text-muted-foreground">DeFi yield on Bitcoin L1</p>
          </div>

          {/* Links */}
          <div>
            <div className="font-retro text-[10px] text-foreground uppercase tracking-wider">Links</div>
            <div className="mt-3 flex flex-col gap-2">
              {FOOTER_LINKS.map(
                (link: FooterLink): ReactElement => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Network */}
          <div>
            <div className="font-retro text-[10px] text-foreground uppercase tracking-wider">Network</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">{network}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground/70">
              Scramble Protocol is experimental software. Use at your own risk.
              Smart contracts are unaudited.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} Scramble Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
