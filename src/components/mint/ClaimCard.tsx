import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Badge, Button, Card, TransactionStatus } from '../common/index.js';
import '../../styles/components/claim-card.css';

interface ClaimCardProps {
  readonly canClaim: boolean;
  readonly claimed: boolean;
  readonly onClaim: () => Promise<void>;
  readonly txState: TransactionState;
}

function ClaimCard({
  canClaim,
  claimed,
  onClaim,
  txState,
}: ClaimCardProps): ReactElement {
  const isTransacting =
    txState.status !== 'idle' &&
    txState.status !== 'confirmed' &&
    txState.status !== 'error';

  function handleClaim(): void {
    void onClaim();
  }

  if (claimed) {
    return (
      <Card glow="egg">
        <div className="claim-card">
          <div className="claim-card__icon claim-card__icon--claimed">
            <span aria-hidden="true">&#x2713;</span>
          </div>
          <Badge variant="success">Already Claimed</Badge>
          <p className="claim-card__title">1,000 $EGG Claimed</p>
          <p className="claim-card__description">
            You have already claimed your 1,000 $EGG allocation.
          </p>
        </div>
      </Card>
    );
  }

  if (!canClaim) {
    return (
      <Card>
        <div className="claim-card">
          <div className="claim-card__icon claim-card__icon--disabled">
            <span aria-hidden="true">&#x2014;</span>
          </div>
          <p className="claim-card__title">Claim Unavailable</p>
          <p className="claim-card__description">
            First 5,000 wallets can claim 1,000 $EGG each. Once all claims are complete, the contract shuts off permanently.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card glow="egg">
      <div className="claim-card">
        <div className="claim-card__icon claim-card__icon--available">
          <span aria-hidden="true">&#x2728;</span>
        </div>
        <p className="claim-card__title claim-card__title--egg">
          Claim 1,000 $EGG
        </p>
        <p className="claim-card__description">
          First 5,000 wallets can claim 1,000 $EGG each. Once all claims are
          complete, the contract shuts off permanently.
        </p>
        <div className="claim-card__actions">
          <Button
            onClick={handleClaim}
            disabled={isTransacting}
            loading={isTransacting}
            fullWidth={true}
            size="lg"
          >
            Claim
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { ClaimCard };
export type { ClaimCardProps };
