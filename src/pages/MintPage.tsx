import React from 'react';
import { PageLayout } from '../components/layout/index.js';
import { useFreeMint } from '../hooks/index.js';
import { useWallet } from '../hooks/index.js';
import { Card, Button, Spinner, ProgressBar, OnThePan, CookingProgress, type CookingStep } from '../components/common/index.js';

const MINT_STEPS: readonly CookingStep[] = [
  { id: 'simulating', label: 'Prepping', description: 'Checking the pantry...' },
  { id: 'signing', label: 'Cracking', description: 'Crack that egg! Confirm in your wallet.' },
  { id: 'broadcasting', label: 'Cooking', description: 'Your order is on the grill. Hang tight!' },
  { id: 'confirmed', label: 'Served', description: '1,000 $EGG, hot off the pan!' },
];

// Claim Card

function ClaimCard({
  canClaim,
  claimed,
  isCooking,
  onClaim,
}: {
  readonly canClaim: boolean;
  readonly claimed: boolean;
  readonly isCooking: boolean;
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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{getStatusText()}</p>
        <Button
          onClick={onClaim}
          disabled={!canClaim || claimed || isCooking}
          loading={isCooking}
          fullWidth
        >
          {claimed ? 'Already Claimed' : isCooking ? 'Cooking...' : 'Claim 1,000 $EGG'}
        </Button>
      </div>
    </Card>
  );
}

// Mint Progress

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
      <ProgressBar
        value={claimedNum}
        max={displayMax}
        variant="egg"
        showLabel
        label={`${String(claimedNum)} / ${String(displayMax)} Claims`}
      />
    </Card>
  );
}

// Main Page

function MintPage(): React.ReactElement {
  const { mintStatus, canClaim, claim, isLoading, txState } = useFreeMint();
  const { isConnected, openConnectModal } = useWallet();

  const isCooking =
    txState.status === 'simulating' ||
    txState.status === 'signing' ||
    txState.status === 'broadcasting';

  function handleClaim(): void {
    void claim();
  }

  if (!isConnected) {
    return (
      <PageLayout title="Free Mint">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-full max-w-md">
            <Card title="Free Mint">
              <p className="mb-4 text-sm text-muted-foreground">
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Free Mint">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <ClaimCard
          canClaim={canClaim}
          claimed={mintStatus?.claimed ?? false}
          isCooking={isCooking}
          onClaim={handleClaim}
        />
        <CookingProgress
          status={txState.status}
          txId={txState.txId}
          error={txState.error}
          message={txState.message}
          steps={MINT_STEPS}
          successMessage="Your eggs have been served. Welcome to the kitchen!"
        />
        <OnThePan txState={txState} />
        <MintProgress
          totalClaimed={mintStatus?.totalClaimed ?? 0n}
          maxClaims={mintStatus?.maxClaims ?? 0n}
        />
      </div>
    </PageLayout>
  );
}

export { MintPage };
