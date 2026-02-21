import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/farm-rewards.css';

interface FarmRewardsProps {
  readonly pendingEgg: bigint;
  readonly onClaim: () => Promise<void>;
  readonly txState: TransactionState;
}

function FarmRewards({
  pendingEgg,
  onClaim,
  txState,
}: FarmRewardsProps): ReactElement {
  const isTransacting =
    txState.status !== 'idle' &&
    txState.status !== 'confirmed' &&
    txState.status !== 'error';

  const hasPending = pendingEgg > 0n;

  function handleClaim(): void {
    void onClaim();
  }

  return (
    <Card title="$EGG LP Mining Rewards" glow="egg">
      <div className="farm-rewards">
        <div className="farm-rewards__pending">
          <p className="farm-rewards__pending-label">Unclaimed Rewards</p>
          <p className="farm-rewards__pending-amount">
            {FormatService.formatBigIntWithDecimals(pendingEgg, 8, 4)}
          </p>
          <p className="farm-rewards__pending-token">$EGG</p>
        </div>

        <div className="farm-rewards__actions">
          <Button
            onClick={handleClaim}
            disabled={!hasPending || isTransacting}
            loading={isTransacting}
            fullWidth={true}
          >
            Claim $EGG
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { FarmRewards };
export type { FarmRewardsProps };
