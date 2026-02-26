import React, { useCallback } from 'react';
import type { HarvestInfo } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useSpatula, useWallet } from '../hooks/index.js';
import { Card, Button, Spinner, TransactionStatus } from '../components/common/index.js';
import { FormatService } from '../services/FormatService.js';

const TOKEN_DECIMALS = 18;

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending Amount</span>
            <span className="font-semibold text-foreground">
              {FormatService.formatBigIntWithDecimals(harvestInfo?.pendingAmount ?? 0n, TOKEN_DECIMALS, 4)} MOTO
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Caller Bounty</span>
            <span className="font-medium text-primary">0.5%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Harvest Block</span>
            <span className="font-medium text-foreground">
              {(harvestInfo?.lastHarvestBlock ?? 0n).toString()}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Anyone can call The Flip. The Spatula claims MotoChef rewards, swaps to MOTO, and splits: 0.5% bounty to caller, 5% to $EGG stakers, 94.5% back to The Pan&apos;s Sizzle drip.
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
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No harvest history yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Block</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Caller</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(
                (entry: HarvestHistoryEntry): React.ReactElement => (
                  <tr key={entry.block.toString()} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{entry.block.toString()}</td>
                    <td className="py-2 text-foreground">
                      {FormatService.formatBigIntWithDecimals(entry.amount, TOKEN_DECIMALS, 4)} MOTO
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {FormatService.formatAddress(entry.caller)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="The Flip">
      <div className="flex flex-col gap-6">
        <div className="mx-auto w-full max-w-lg flex flex-col gap-4">
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
