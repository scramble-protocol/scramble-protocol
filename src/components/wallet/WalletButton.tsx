import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { useWallet } from '../../hooks/useWallet.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/wallet-button.css';

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
      <div className="wallet-button">
        <button
          type="button"
          className="wallet-button__connect"
          onClick={handleConnect}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const truncatedAddress: string = FormatService.formatAddress(address);
  const formattedBalance: string = FormatService.formatBigIntWithDecimals(
    balance,
    8,
    4,
  );

  return (
    <div className="wallet-button" ref={containerRef}>
      <button
        type="button"
        className="wallet-button__trigger"
        onClick={toggleDropdown}
      >
        <span className="wallet-button__address">{truncatedAddress}</span>
        <span className="wallet-button__network-badge">{network}</span>
      </button>

      {dropdownOpen && (
        <div className="wallet-button__dropdown">
          <span className="wallet-button__dropdown-label">Address</span>
          <div
            className="wallet-button__full-address"
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
            <span>{address}</span>
            <span className="wallet-button__copy-hint">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </div>

          <div className="wallet-button__balance-row">
            <span className="wallet-button__balance-label">Balance</span>
            <span className="wallet-button__balance-value">
              {formattedBalance} BTC
            </span>
          </div>

          <div className="wallet-button__divider" />

          <button
            type="button"
            className="wallet-button__disconnect"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

export { WalletButton };
