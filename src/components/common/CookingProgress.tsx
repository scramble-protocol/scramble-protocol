import type { ReactElement } from 'react';
import type { TransactionStatus as TxStatus } from '../../types/index.js';
import { Card } from './Card.js';
import { Spinner } from './Spinner.js';
import { PixelEmoji } from './PixelEmoji.js';
import { cn } from '@/lib/utils.js';

// ─── Types ───────────────────────────────────────────────────

export interface CookingStep {
  readonly id: TxStatus;
  readonly label: string;
  readonly description: string;
}

export interface CookingProgressProps {
  readonly status: TxStatus;
  readonly txId?: string;
  readonly error?: string;
  /** Dynamic message from the hook — shown instead of the step description when present. */
  readonly message?: string;
  readonly steps: readonly CookingStep[];
  /** Displayed after confirmed. */
  readonly successMessage: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function truncateTxId(txId: string): string {
  if (txId.length <= 16) return txId;
  return `${txId.slice(0, 8)}...${txId.slice(-8)}`;
}

function getStepIndex(steps: readonly CookingStep[], status: TxStatus): number {
  return steps.findIndex((s) => s.id === status);
}

// ─── Component ───────────────────────────────────────────────

function CookingProgress({
  status,
  txId,
  error,
  message,
  steps,
  successMessage,
}: CookingProgressProps): ReactElement | null {
  if (status === 'idle') return null;

  if (status === 'error') {
    const errorMsg = error ?? 'Something went wrong in the kitchen.';
    const emojiMatch = errorMsg.match(/(\p{Emoji_Presentation})/u);
    const emoji = emojiMatch?.[1];
    const textOnly = emoji ? errorMsg.replace(emoji, '').trim() : errorMsg;

    return (
      <Card>
        <div className="flex items-center gap-3 text-destructive">
          <span className="text-xl">&#x2715;</span>
          <p className="text-sm">{textOnly}</p>
          {emoji && <PixelEmoji emoji={emoji} size={28} />}
        </div>
      </Card>
    );
  }

  const activeIdx = getStepIndex(steps, status);
  const isConfirmed = status === 'confirmed';
  const progressPercent = isConfirmed
    ? 100
    : activeIdx >= 0
      ? ((activeIdx + 0.5) / steps.length) * 100
      : 0;

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full transition-all duration-500',
              isConfirmed ? 'bg-green-500' : 'bg-primary',
            )}
            style={{ width: `${String(progressPercent)}%` }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => {
            const isDone = activeIdx > i || isConfirmed;
            const isActive = activeIdx === i && !isConfirmed;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-md p-2 transition-colors',
                  isDone && 'bg-green-500/10',
                  isActive && 'bg-primary/10',
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
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDone
                        ? 'text-green-400'
                        : isActive
                          ? 'text-primary'
                          : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {(isActive || isDone) && (
                    <span className="text-xs text-muted-foreground">
                      {(isActive || (isConfirmed && i === activeIdx)) && message ? message : step.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirmed message */}
        {isConfirmed && txId !== undefined && (
          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-center">
            <p className="text-sm text-green-400">{message ?? successMessage}</p>
            <a
              className="mt-1 inline-block text-xs text-primary hover:underline"
              href={`https://opscan.org/transactions/${txId}?network=op_testnet`}
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

export { CookingProgress };
