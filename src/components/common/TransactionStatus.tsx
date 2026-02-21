import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Spinner } from './Spinner.js';
import '../../styles/components/transaction-status.css';

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
      <div className="tx-status">
        <Spinner size="sm" />
        <span>{pendingLabel}</span>
      </div>
    );
  }

  if (status === 'confirmed') {
    const txId = state.txId;
    return (
      <div className="tx-status tx-status--confirmed">
        <span className="tx-status__check-icon" aria-hidden="true">
          &#x2713;
        </span>
        <span>Confirmed</span>
        {txId !== undefined && (
          <a
            className="tx-status__link"
            href={`https://explorer.opnet.org/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {truncateTxId(txId)}
          </a>
        )}
      </div>
    );
  }

  if (status === 'error') {
    const errorMessage = state.error ?? 'Transaction failed';
    return (
      <div className="tx-status tx-status--error">
        <span className="tx-status__error-icon" aria-hidden="true">
          &#x2715;
        </span>
        <span>{errorMessage}</span>
      </div>
    );
  }

  return null;
}

export { TransactionStatusComponent as TransactionStatus };
export type { TransactionStatusProps };
