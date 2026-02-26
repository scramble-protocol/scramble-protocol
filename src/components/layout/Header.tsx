import { useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import { useAudio } from '../../contexts/AudioContext.js';
import { WalletButton } from '../wallet/WalletButton.js';
import { Button as BitButton } from '@/components/ui/8bit/button.js';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/8bit/navigation-menu.js';
import { cn } from '@/lib/utils.js';

interface NavItem {
  readonly label: string;
  readonly to: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'The Pan', to: '/vault' },
  { label: 'Egg Staking', to: '/stake' },
  { label: 'LP Mining', to: '/farm' },
  { label: 'The Flip', to: '/harvest' },
  { label: 'Dashboard', to: '/dashboard' },
] as const;

function Header(): ReactElement {
  const { theme, toggleTheme } = useTheme();
  const { isPlaying, toggleMusic } = useAudio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const openMobileMenu = useCallback((): void => {
    setMobileMenuOpen(true);
  }, []);

  const closeMobileMenu = useCallback((): void => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="font-retro text-xs text-primary hover:text-primary/80 transition-colors">
          Scramble
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex" font="normal" viewport={false}>
          <NavigationMenuList>
            {NAV_ITEMS.map(
              (item: NavItem): ReactElement => (
                <NavigationMenuItem key={item.to}>
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }): string =>
                        cn(
                          'inline-flex items-center justify-center px-2 py-1 text-[10px] rounded-sm transition-colors',
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <BitButton
            variant="ghost"
            size="icon"
            onClick={toggleMusic}
            aria-label={isPlaying ? 'Mute music' : 'Play music'}
          >
            {isPlaying ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </BitButton>

          <BitButton
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </BitButton>

          <div className="hidden sm:block">
            <WalletButton />
          </div>

          <BitButton
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={openMobileMenu}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </BitButton>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
          role="presentation"
        />
      )}

      {/* Mobile slide-in menu */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border p-6 transition-transform duration-300 md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          onClick={closeMobileMenu}
          aria-label="Close navigation menu"
        >
          <X className="size-5" />
        </button>

        <nav className="mt-12 flex flex-col gap-2">
          {NAV_ITEMS.map(
            (item: NavItem): ReactElement => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }): string =>
                  cn(
                    'px-3 py-2 text-sm rounded-md transition-colors',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
                onClick={closeMobileMenu}
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <BitButton
            variant="ghost"
            size="sm"
            onClick={toggleMusic}
            aria-label={isPlaying ? 'Mute music' : 'Play music'}
          >
            {isPlaying ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            <span className="ml-2 text-sm">{isPlaying ? 'Sound off' : 'Sound on'}</span>
          </BitButton>
          <BitButton
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            <span className="ml-2 text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </BitButton>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export { Header };
