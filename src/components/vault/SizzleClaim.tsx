import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/sizzle-claim.css';

interface SizzleClaimProps {
  readonly pendingSizzle: bigint;
  readonly onClaim: () => Promise<void>;
  readonly txState: TransactionState;
}

function SizzleClaim({
  pendingSizzle,
  onClaim,
  txState,
}: SizzleClaimProps): ReactElement {
  const formattedSizzle = FormatService.formatTokenAmount(pendingSizzle, 8);
  const hasSizzle = pendingSizzle > 0n;

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';

  function handleClaim(): void {
    void onClaim();
  }

  return (
    <Card title="Sizzle Rewards" subtitle="Fees and yield stream to Shell Token holders over ~1,008 blocks (~7 days) via the Sizzle drip." glow={hasSizzle ? 'sizzle' : 'none'}>
      <div className="sizzle-claim">
        <div className="sizzle-claim__reward">
          <p className="sizzle-claim__reward-label">Pending Rewards</p>
          <p className="sizzle-claim__reward-amount">{formattedSizzle}</p>
          <p className="sizzle-claim__reward-token">SIZZLE</p>
        </div>

        <div className="sizzle-claim__actions">
          <Button
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting || !hasSizzle}
            onClick={handleClaim}
          >
            Claim Sizzle
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { SizzleClaim };
export type { SizzleClaimProps };
