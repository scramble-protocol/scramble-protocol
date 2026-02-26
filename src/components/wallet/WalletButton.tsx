import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useWallet } from '../../hooks/useWallet.js';
import { FormatService } from '../../services/FormatService.js';
import { Button as BitButton } from '@/components/ui/8bit/button.js';
import { cn } from '@/lib/utils.js';

function WalletButton(): ReactElement {
  const { address, isConnected, balance, connect, disconnect, network } =
    useWallet();

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback((): void => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleConnect = useCallback((): void => {
    connect();
  }, [connect]);

  const handleDisconnect = useCallback((): void => {
    disconnect();
    setDropdownOpen(false);
  }, [disconnect]);

  const handleCopyAddress = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      e.stopPropagation();
      if (address === undefined) {
        return;
      }
      void navigator.clipboard.writeText(address).then((): void => {
        setCopied(true);
        setTimeout((): void => {
          setCopied(false);
        }, 2000);
      });
    },
    [address],
  );

  useEffect((): (() => void) => {
    function handleClickOutside(event: globalThis.MouseEvent): void {
      if (
        containerRef.current !== null &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isConnected || address === undefined) {
    return (
      <BitButton variant="default" size="sm" onClick={handleConnect}>
        Connect Wallet
      </BitButton>
    );
  }

  const truncatedAddress: string = FormatService.formatAddress(address);
  const formattedBalance: string = FormatService.formatBigIntWithDecimals(
    balance,
    8,
    4,
  );

  return (
    <div className="relative" ref={containerRef}>
      <BitButton
        variant="outline"
        size="sm"
        onClick={toggleDropdown}
        className="gap-2"
      >
        <span className="text-xs">{truncatedAddress}</span>
        <span className="text-[10px] rounded bg-primary/20 px-1.5 py-0.5 text-primary">
          {network}
        </span>
      </BitButton>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-md border border-border bg-card p-4 shadow-lg z-50 animate-fade-in">
          <span className="text-xs text-muted-foreground">Address</span>
          <div
            className={cn(
              'mt-1 cursor-pointer rounded bg-secondary p-2 text-xs font-mono break-all',
              'hover:bg-secondary/80 transition-colors'
            )}
            role="button"
            tabIndex={0}
            onClick={handleCopyAddress}
            onKeyDown={(e): void => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCopyAddress(
                  e as unknown as MouseEvent<HTMLDivElement>,
                );
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span>{address}</span>
              <span className="ml-2 text-primary shrink-0">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Balance</span>
            <span className="text-sm text-foreground">
              {formattedBalance} BTC
            </span>
          </div>

          <div className="my-3 h-px bg-border" />

          <BitButton
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            className="w-full"
          >
            Disconnect
          </BitButton>
        </div>
      )}
    </div>
  );
}

export { WalletButton };
