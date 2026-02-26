import React from 'react';
import type { TransactionStatus as TxStatus } from '../types/index.js';
import { PageLayout } from '../components/layout/index.js';
import { useFreeMint } from '../hooks/index.js';
import { useWallet } from '../hooks/index.js';
import { Card } from '../components/common/index.js';
import { Button } from '../components/common/index.js';
import { Spinner } from '../components/common/index.js';
import { ProgressBar } from '../components/common/index.js';
import { OnThePan } from '../components/common/index.js';
import { cn } from '@/lib/utils.js';

// Cooking steps for the progress tracker

interface CookingStep {
  readonly id: TxStatus;
  readonly label: string;
  readonly description: string;
}

const COOKING_STEPS: readonly CookingStep[] = [
  { id: 'simulating', label: 'Prepping', description: 'Checking the pantry...' },
  { id: 'signing', label: 'Cracking', description: 'Crack that egg! Confirm in your wallet.' },
  { id: 'broadcasting', label: 'Cooking', description: 'Your order is on the grill. Hang tight!' },
  { id: 'confirmed', label: 'Served', description: '1,000 $EGG, hot off the pan!' },
];

function getStepIndex(status: TxStatus): number {
  return COOKING_STEPS.findIndex((s) => s.id === status);
}

function truncateTxId(txId: string): string {
  if (txId.length <= 16) return txId;
  return `${txId.slice(0, 8)}...${txId.slice(-8)}`;
}

// Cooking Progress Tracker

function CookingProgress({
  status,
  txId,
  error,
}: {
  readonly status: TxStatus;
  readonly txId?: string;
  readonly error?: string;
}): React.ReactElement | null {
  if (status === 'idle') return null;

  if (status === 'error') {
    return (
      <Card>
        <div className="flex items-center gap-3 text-destructive">
          <span className="text-xl">&#x2715;</span>
          <p className="text-sm">{error ?? 'Something went wrong in the kitchen.'}</p>
        </div>
      </Card>
    );
  }

  const activeIdx = getStepIndex(status);
  const isConfirmed = status === 'confirmed';
  const progressPercent = isConfirmed
    ? 100
    : activeIdx >= 0
      ? ((activeIdx + 0.5) / COOKING_STEPS.length) * 100
      : 0;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full transition-all duration-500',
              isConfirmed ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${String(progressPercent)}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {COOKING_STEPS.map((step, i) => {
            const isDone = activeIdx > i || isConfirmed;
            const isActive = activeIdx === i && !isConfirmed;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 transition-colors',
                  isDone && 'bg-green-500/10',
                  isActive && 'bg-primary/10'
                )}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                  {isDone ? (
                    <span className="text-green-500">&#x2713;</span>
                  ) : isActive ? (
                    <Spinner size="sm" />
                  ) : (
                    <span className="text-muted-foreground">{String(i + 1)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    'text-sm font-medium',
                    isDone ? 'text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  {(isActive || isDone) && (
                    <span className="text-xs text-muted-foreground">{step.description}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmed message */}
        {isConfirmed && txId !== undefined && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-center">
            <p className="text-sm text-green-400">
              Your eggs have been served. Welcome to the kitchen!
            </p>
            <a
              className="mt-1 inline-block text-xs text-primary hover:underline"
              href={`https://testnet.opnet.org/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View receipt: {truncateTxId(txId)}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

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
