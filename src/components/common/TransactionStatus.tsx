import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Spinner } from './Spinner.js';

interface TransactionStatusProps {
  readonly state: TransactionState;
}

function truncateTxId(txId: string): string {
  if (txId.length <= 16) {
    return txId;
  }
  return `${txId.slice(0, 8)}...${txId.slice(-8)}`;
}

const STATUS_LABELS: Record<string, string> = {
  approving: 'Approving...',
  confirming: 'Waiting for approval to confirm...',
  simulating: 'Simulating...',
  signing: 'Waiting for wallet...',
  broadcasting: 'Broadcasting...',
};

function TransactionStatusComponent({
  state,
}: TransactionStatusProps): ReactElement | null {
  const { status } = state;

  if (status === 'idle') {
    return null;
  }

  const pendingLabel = STATUS_LABELS[status];
  if (pendingLabel !== undefined) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
        <Spinner size="sm" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-foreground">{pendingLabel}</span>
          {state.message !== undefined && (
            <span className="text-xs text-muted-foreground">{state.message}</span>
          )}
        </div>
      </div>
    );
  }

  if (status === 'confirmed') {
    const txId = state.txId;
    return (
      <div className="flex items-center gap-3 rounded-md border border-green-500/30 bg-green-500/10 p-3">
        <span className="text-green-500 text-lg" aria-hidden="true">&#x2713;</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-green-400">Confirmed</span>
          {state.message !== undefined && (
            <span className="text-xs text-green-300">{state.message}</span>
          )}
          {txId !== undefined && (
            <a
              className="text-xs text-primary hover:underline"
              href={`https://explorer.opnet.org/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {truncateTxId(txId)}
            </a>
          )}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    const errorMessage = state.error ?? 'Transaction failed';
    return (
      <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3">
        <span className="text-destructive text-lg" aria-hidden="true">&#x2715;</span>
        <span className="text-sm text-destructive">{errorMessage}</span>
      </div>
    );
  }

  return null;
}

export { TransactionStatusComponent as TransactionStatus };
export type { TransactionStatusProps };
