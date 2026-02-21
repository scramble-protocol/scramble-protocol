import React from 'react';
import { PageLayout } from '../components/layout/index.js';
import { useFreeMint } from '../hooks/index.js';
import { useWallet } from '../hooks/index.js';
import { Card } from '../components/common/index.js';
import { Button } from '../components/common/index.js';
import { Spinner } from '../components/common/index.js';
import { ProgressBar } from '../components/common/index.js';
import { TransactionStatus } from '../components/common/index.js';
import '../styles/components/mint-page.css';

function ClaimCard({
  canClaim,
  claimed,
  isLoading,
  onClaim,
}: {
  readonly canClaim: boolean;
  readonly claimed: boolean;
  readonly isLoading: boolean;
  readonly onClaim: () => void;
}): React.ReactElement {
  function getStatusText(): string {
    if (claimed) {
      return 'You have already claimed your 1,000 $EGG.';
    }
    if (canClaim) {
      return 'You are eligible to claim 1,000 $EGG. First 5,000 wallets can claim 1,000 $EGG each. Once all claims are complete, the contract shuts off permanently.';
    }
    return 'You are not currently eligible to claim.';
  }

  return (
    <Card title="Claim 1,000 $EGG" subtitle="One free mint per wallet">
      <div className="mint-page__claim-card">
        <p className="mint-page__status-text">{getStatusText()}</p>
        <Button
          onClick={onClaim}
          disabled={!canClaim || claimed || isLoading}
          loading={isLoading}
          fullWidth
        >
          {claimed ? 'Already Claimed' : 'Claim 1,000 $EGG'}
        </Button>
      </div>
    </Card>
  );
}

function MintProgress({
  totalClaimed,
  maxClaims,
}: {
  readonly totalClaimed: bigint;
  readonly maxClaims: bigint;
}): React.ReactElement {
  const claimedNum = Number(totalClaimed);
  const maxNum = Number(maxClaims);
  const displayMax = maxNum > 0 ? maxNum : 1;

  return (
    <Card title="Mint Progress">
      <div className="mint-page__progress">
        <ProgressBar
          value={claimedNum}
          max={displayMax}
          variant="egg"
          showLabel
          label={`${String(claimedNum)} / ${String(displayMax)} Claims`}
        />
      </div>
    </Card>
  );
}

function MintPage(): React.ReactElement {
  const { mintStatus, canClaim, claim, isLoading, txState } = useFreeMint();
  const { isConnected, openConnectModal } = useWallet();

  function handleClaim(): void {
    void claim();
  }

  if (!isConnected) {
    return (
      <PageLayout title="Free Mint">
        <div className="mint-page">
          <div className="mint-page__connect-prompt">
            <Card title="Free Mint">
              <p className="mint-page__connect-text">
                Connect your wallet to claim 1,000 $EGG. First 5,000 wallets can claim 1,000 $EGG each. Once all claims are complete, the contract shuts off permanently.
              </p>
              <Button onClick={openConnectModal} fullWidth>
                Connect Wallet
              </Button>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isLoading && mintStatus === null) {
    return (
      <PageLayout title="Free Mint">
        <div className="mint-page">
          <div className="mint-page__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Free Mint">
      <div className="mint-page">
        <div className="mint-page__centered">
          <ClaimCard
            canClaim={canClaim}
            claimed={mintStatus?.claimed ?? false}
            isLoading={isLoading}
            onClaim={handleClaim}
          />
          <MintProgress
            totalClaimed={mintStatus?.totalClaimed ?? 0n}
            maxClaims={mintStatus?.maxClaims ?? 0n}
          />
          <TransactionStatus state={txState} />
        </div>
      </div>
    </PageLayout>
  );
}

export { MintPage };
