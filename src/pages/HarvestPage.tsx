import React, { useCallback } from 'react';
import type { HarvestInfo } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useSpatula, useWallet } from '../hooks/index.js';
import { Card, Button, Spinner, TransactionStatus } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';
import '../styles/components/harvest-page.css';

const TOKEN_DECIMALS = 8;

interface HarvestHistoryEntry {
  readonly block: bigint;
  readonly amount: bigint;
  readonly caller: string;
}

function HarvestCard({
  harvestInfo,
  isConnected,
  onHarvest,
  isLoading,
}: {
  readonly harvestInfo: HarvestInfo | null;
  readonly isConnected: boolean;
  readonly onHarvest: () => void;
  readonly isLoading: boolean;
}): React.ReactElement {
  return (
    <Card title="The Flip" subtitle="Anyone can call The Flip to harvest protocol yields" glow="sizzle">
      <div className="harvest-page__card-content">
        <div className="harvest-page__info-grid">
          <div className="harvest-page__info-row">
            <span className="harvest-page__info-label">Pending Amount</span>
            <span className="harvest-page__info-value">
              {FormatService.formatBigIntWithDecimals(harvestInfo?.pendingAmount ?? 0n, TOKEN_DECIMALS, 4)} MOTO
            </span>
          </div>
          <div className="harvest-page__info-row">
            <span className="harvest-page__info-label">Caller Bounty</span>
            <span className="harvest-page__info-value">
              0.5%
            </span>
          </div>
          <div className="harvest-page__info-row">
            <span className="harvest-page__info-label">Last Harvest Block</span>
            <span className="harvest-page__info-value">
              {(harvestInfo?.lastHarvestBlock ?? 0n).toString()}
            </span>
          </div>
        </div>
        <p className="harvest-page__note">
          Anyone can call The Flip. The Spatula claims MotoChef rewards, swaps to MOTO, and splits: 0.5% bounty to caller, 5% to $EGG stakers, 94.5% back to The Pan's Sizzle drip.
        </p>
        <Button
          onClick={onHarvest}
          disabled={isLoading || (harvestInfo?.pendingAmount ?? 0n) === 0n}
          loading={isLoading}
          fullWidth
        >
          {isConnected ? 'Harvest Now' : 'Connect Wallet to Harvest'}
        </Button>
      </div>
    </Card>
  );
}

function HarvestHistory({
  entries,
}: {
  readonly entries: readonly HarvestHistoryEntry[];
}): React.ReactElement {
  return (
    <Card title="Harvest History">
      <div className="harvest-page__history">
        {entries.length === 0 ? (
          <p className="harvest-page__empty-text">No harvest history yet.</p>
        ) : (
          <table className="harvest-page__table">
            <thead>
              <tr>
                <th className="harvest-page__th">Block</th>
                <th className="harvest-page__th">Amount</th>
                <th className="harvest-page__th">Caller</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(
                (entry: HarvestHistoryEntry): React.ReactElement => (
                  <tr key={entry.block.toString()} className="harvest-page__tr">
                    <td className="harvest-page__td">{entry.block.toString()}</td>
                    <td className="harvest-page__td">
                      {FormatService.formatBigIntWithDecimals(entry.amount, TOKEN_DECIMALS, 4)} MOTO
                    </td>
                    <td className="harvest-page__td">
                      {FormatService.formatAddress(entry.caller)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

function HarvestPage(): React.ReactElement {
  const spatula = useSpatula();
  const { isConnected, openConnectModal } = useWallet();

  const harvestHistory: readonly HarvestHistoryEntry[] = [] as const;

  const handleHarvest = useCallback((): void => {
    if (!isConnected) {
      openConnectModal();
      return;
    }
    void spatula.harvest(0n);
  }, [isConnected, openConnectModal, spatula]);

  if (spatula.isLoading && spatula.harvestInfo === null) {
    return (
      <PageLayout title="The Flip">
        <div className="harvest-page">
          <div className="harvest-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="The Flip">
      <div className="harvest-page">
        <div className="harvest-page__centered">
          <HarvestCard
            harvestInfo={spatula.harvestInfo}
            isConnected={isConnected}
            onHarvest={handleHarvest}
            isLoading={spatula.isLoading}
          />
          <TransactionStatus state={spatula.txState} />
        </div>
        <HarvestHistory entries={harvestHistory} />
      </div>
    </PageLayout>
  );
}

export { HarvestPage };
