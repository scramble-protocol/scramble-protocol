import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { useBlockHeight } from '../../hooks/index.js';

interface OnThePanProps {
  readonly txState: TransactionState;
}

function OnThePan({ txState }: OnThePanProps): ReactElement | null {
  const { blockHeight } = useBlockHeight();

  if (txState.status !== 'confirmed') return null;

  return (
    <div className="flex items-start gap-4 rounded-md border border-egg/30 bg-egg/5 p-4 animate-fade-in">
      <div className="shrink-0 text-egg">
        <svg
          className="size-12"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse cx="20" cy="26" rx="16" ry="10" className="fill-border stroke-egg" strokeWidth="1.5" />
          <rect x="36" y="23" width="12" height="4" rx="2" className="fill-border stroke-egg" strokeWidth="1" />
          <path d="M12 18 Q13 14 12 10" className="stroke-egg/60" strokeWidth="1.5" fill="none">
            <animate attributeName="d" values="M12 18 Q13 14 12 10;M12 18 Q11 14 12 10;M12 18 Q13 14 12 10" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M20 16 Q21 12 20 8" className="stroke-egg/60" strokeWidth="1.5" fill="none">
            <animate attributeName="d" values="M20 16 Q21 12 20 8;M20 16 Q19 12 20 8;M20 16 Q21 12 20 8" dur="2.5s" repeatCount="indefinite" />
          </path>
          <path d="M28 18 Q29 14 28 10" className="stroke-egg/60" strokeWidth="1.5" fill="none">
            <animate attributeName="d" values="M28 18 Q29 14 28 10;M28 18 Q27 14 28 10;M28 18 Q29 14 28 10" dur="1.8s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-retro text-xs text-egg">Sizzling on the pan...</p>
        <p className="text-sm text-muted-foreground">
          Your transaction is in the mempool, waiting to be flipped into the next Bitcoin block.
          This usually takes 3-10 minutes. Balances update automatically once confirmed.
        </p>
        <p className="text-xs text-muted-foreground">
          Current block: {blockHeight > 0 ? String(blockHeight) : '...'}
        </p>
      </div>
    </div>
  );
}

export { OnThePan };
export type { OnThePanProps };
