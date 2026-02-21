import { useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { WalletButton } from '../wallet/WalletButton.js';
import '../../styles/components/header.css';

interface NavItem {
  readonly label: string;
  readonly to: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Vault', to: '/vault' },
  { label: 'Stake', to: '/stake' },
  { label: 'Farm', to: '/farm' },
  { label: 'Harvest', to: '/harvest' },
  { label: 'Dashboard', to: '/dashboard' },
] as const;

function getNavLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'header__nav-link';
  return isActive ? `${base} header__nav-link--active` : base;
}

function getMobileNavLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'header__mobile-nav-link';
  return isActive ? `${base} header__mobile-nav-link--active` : base;
}

function Header(): ReactElement {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const openMobileMenu = useCallback((): void => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setMobileMenuOpen(false);
  }, []);

  const themeIcon: string = theme === 'dark' ? '\u263D' : '\u2600';

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          Scramble
        </Link>

        <nav className="header__nav">
          {NAV_ITEMS.map(
            (item: NavItem): ReactElement => (
              <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {themeIcon}
          </button>

          <div className="wallet-button-wrapper">
            <WalletButton />
          </div>

          <button
            type="button"
            className="header__hamburger"
            onClick={openMobileMenu}
            aria-label="Open navigation menu"
          >
            &#9776;
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`header__overlay${mobileMenuOpen ? ' header__overlay--visible' : ''}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      {/* Mobile slide-in menu */}
      <div
        className={`header__mobile-menu${mobileMenuOpen ? ' header__mobile-menu--open' : ''}`}
      >
        <button
          type="button"
          className="header__mobile-close"
          onClick={closeMobileMenu}
          aria-label="Close navigation menu"
        >
          &#10005;
        </button>

        <nav className="header__mobile-nav">
          {NAV_ITEMS.map(
            (item: NavItem): ReactElement => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getMobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="header__mobile-actions">
          <button
            type="button"
            className="header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {themeIcon}
          </button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export { Header };
