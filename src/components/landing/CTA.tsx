import React from 'react';
import { Link } from 'react-router-dom';
import { Button as BitButton } from '@/components/ui/8bit/button.js';

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
    <section className="py-20 px-4">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2 className="font-retro text-sm text-primary sm:text-base">
          Get in the Pan. Stay crunchy.
        </h2>

        {hasConnectHandler ? (
          <BitButton variant="default" size="lg" onClick={handleClick}>
            Connect Wallet
          </BitButton>
        ) : (
          <BitButton variant="default" size="lg" asChild>
            <Link to="/vault">Connect Wallet</Link>
          </BitButton>
        )}

        <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Social links">
          {SOCIAL_LINKS.map(
            (link: SocialLink): React.ReactElement => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="mt-4 flex flex-col gap-2">
          <p className="font-retro text-xs text-muted-foreground">
            scramble.finance &mdash; DeFi yield on Bitcoin
          </p>
          <p className="text-xs text-muted-foreground/60">
            This protocol is experimental. Participation carries risk. Do your
            own research before depositing funds.
          </p>
        </div>
      </div>
    </section>
  );
}

export { CTA };
