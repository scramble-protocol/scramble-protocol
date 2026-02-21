import type { ReactElement } from 'react';
import type { HarvestInfo, TransactionState } from '../../types/index.js';
import { Button, Card, Spinner, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/harvest-card.css';

interface HarvestCardProps {
  readonly harvestInfo: HarvestInfo | null;
  readonly onHarvest: (minAmountOut: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly isLoading: boolean;
}

function HarvestCard({
  harvestInfo,
  onHarvest,
  txState,
  isLoading,
}: HarvestCardProps): ReactElement {
  const isTransacting =
    txState.status !== 'idle' &&
    txState.status !== 'confirmed' &&
    txState.status !== 'error';

  function handleHarvest(): void {
    if (harvestInfo !== null) {
      void onHarvest(0n);
    }
  }

  if (isLoading || harvestInfo === null) {
    return (
      <Card title="The Flip">
        <div className="harvest-card__skeleton">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  const pendingFormatted = FormatService.formatBigIntWithDecimals(
    harvestInfo.pendingAmount,
    8,
    4,
  );
  const bountyEstimate = harvestInfo.pendingAmount * 50n / 10000n;
  const bountyFormatted = FormatService.formatBigIntWithDecimals(
    bountyEstimate,
    8,
    4,
  );
  const hasPending = harvestInfo.pendingAmount > 0n;

  return (
    <Card title="The Flip">
      <div className="harvest-card">
        <div className="harvest-card__stats">
          <div className="harvest-card__stat">
            <p className="harvest-card__stat-label">Pending Amount</p>
            <p className="harvest-card__stat-value">{pendingFormatted}</p>
          </div>
          <div className="harvest-card__stat">
            <p className="harvest-card__stat-label">Bounty Estimate (0.5%)</p>
            <p className="harvest-card__stat-value harvest-card__stat-value--accent">
              {bountyFormatted}
            </p>
          </div>
        </div>

        <p className="harvest-card__explanation">
          Anyone can call The Flip. The Spatula claims MotoChef rewards, swaps to MOTO, and splits: 0.5% bounty to caller, 5% to $EGG stakers, 94.5% back to The Pan's Sizzle drip.
        </p>

        <div className="harvest-card__actions">
          <Button
            onClick={handleHarvest}
            disabled={!hasPending || isTransacting}
            loading={isTransacting}
            fullWidth={true}
          >
            Harvest
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { HarvestCard };
export type { HarvestCardProps };
