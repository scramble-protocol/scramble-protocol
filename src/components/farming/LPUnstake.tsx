import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/lp-unstake.css';

interface LPUnstakeProps {
  readonly onUnstake: (amount: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly stakedAmount: bigint;
  readonly isLoading: boolean;
}

function LPUnstake({
  onUnstake,
  txState,
  stakedAmount,
  isLoading,
}: LPUnstakeProps): ReactElement {
  const [inputValue, setInputValue] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(inputValue, 8);
  const isValidAmount = parsedAmount > 0n && parsedAmount <= stakedAmount;
  const isTransacting =
    txState.status !== 'idle' &&
    txState.status !== 'confirmed' &&
    txState.status !== 'error';

  function handleMax(): void {
    setInputValue(FormatService.formatTokenAmount(stakedAmount, 8));
  }

  function handleUnstake(): void {
    if (isValidAmount) {
      void onUnstake(parsedAmount);
    }
  }

  return (
    <div className="lp-unstake">
      <div className="lp-unstake__balance">
        <span className="lp-unstake__balance-label">Staked $EGG-MOTO LP</span>
        <span className="lp-unstake__balance-value">
          {FormatService.formatBigIntWithDecimals(stakedAmount, 8, 4)}
        </span>
      </div>

      <Input
        label="Amount to Unstake"
        value={inputValue}
        onChange={setInputValue}
        placeholder="0.0"
        maxButton={true}
        onMax={handleMax}
        suffix="LP"
        disabled={isLoading || isTransacting}
      />

      <div className="lp-unstake__actions">
        <Button
          variant="secondary"
          onClick={handleUnstake}
          disabled={!isValidAmount || isLoading || isTransacting}
          loading={isTransacting}
          fullWidth={true}
        >
          Unstake $EGG-MOTO LP
        </Button>

        <TransactionStatus state={txState} />
      </div>
    </div>
  );
}

export { LPUnstake };
export type { LPUnstakeProps };
