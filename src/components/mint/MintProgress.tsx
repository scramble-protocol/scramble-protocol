import type { ReactElement } from 'react';
import { ProgressBar } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/mint-progress.css';

interface MintProgressProps {
  readonly totalClaimed: bigint;
  readonly maxClaims: bigint;
}

function MintProgress({
  totalClaimed,
  maxClaims,
}: MintProgressProps): ReactElement {
  const claimedNumber = Number(totalClaimed);
  const maxNumber = Number(maxClaims);
  const remaining = maxClaims > totalClaimed ? maxClaims - totalClaimed : 0n;

  return (
    <div className="mint-progress">
      <div className="mint-progress__header">
        <h4 className="mint-progress__title">Mint Progress</h4>
        <p className="mint-progress__count">
          {FormatService.formatTokenAmount(totalClaimed, 0)} /{' '}
          {FormatService.formatTokenAmount(maxClaims, 0)} Claims
        </p>
      </div>

      <ProgressBar
        value={claimedNumber}
        max={maxNumber}
        variant="egg"
        showLabel={true}
      />

      <p className="mint-progress__remaining">
        {FormatService.formatTokenAmount(remaining, 0)} claims remaining
      </p>
    </div>
  );
}

export { MintProgress };
export type { MintProgressProps };
