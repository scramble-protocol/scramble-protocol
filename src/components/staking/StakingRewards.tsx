import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/staking-rewards.css';

interface StakingRewardsProps {
  readonly pendingRewards: bigint;
  readonly onClaim: () => Promise<void>;
  readonly txState: TransactionState;
}

function StakingRewards({
  pendingRewards,
  onClaim,
  txState,
}: StakingRewardsProps): ReactElement {
  const formattedRewards = FormatService.formatTokenAmount(pendingRewards, 8);
  const hasRewards = pendingRewards > 0n;

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';

  function handleClaim(): void {
    void onClaim();
  }

  return (
    <Card title="Staking Rewards (MOTO)">
      <div className="staking-rewards">
        <div className="staking-rewards__reward">
          <p className="staking-rewards__reward-label">Pending Rewards</p>
          <p className="staking-rewards__reward-amount">{formattedRewards}</p>
          <p className="staking-rewards__reward-token">MOTO</p>
        </div>

        <div className="staking-rewards__actions">
          <Button
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting || !hasRewards}
            onClick={handleClaim}
          >
            Claim Rewards
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { StakingRewards };
export type { StakingRewardsProps };
