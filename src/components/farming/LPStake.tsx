import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/lp-stake.css';

interface LPStakeProps {
  readonly onStake: (amount: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly lpBalance: bigint;
  readonly isLoading: boolean;
}

function LPStake({
  onStake,
  txState,
  lpBalance,
  isLoading,
}: LPStakeProps): ReactElement {
  const [inputValue, setInputValue] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(inputValue, 8);
  const isValidAmount = parsedAmount > 0n && parsedAmount <= lpBalance;
  const isTransacting =
    txState.status !== 'idle' &&
    txState.status !== 'confirmed' &&
    txState.status !== 'error';

  function handleMax(): void {
    setInputValue(FormatService.formatTokenAmount(lpBalance, 8));
  }

  function handleStake(): void {
    if (isValidAmount) {
      void onStake(parsedAmount);
    }
  }

  return (
    <div className="lp-stake">
      <div className="lp-stake__balance">
        <span className="lp-stake__balance-label">$EGG-MOTO LP Balance</span>
        <span className="lp-stake__balance-value">
          {FormatService.formatBigIntWithDecimals(lpBalance, 8, 4)}
        </span>
      </div>

      <Input
        label="Amount to Stake"
        value={inputValue}
        onChange={setInputValue}
        placeholder="0.0"
        maxButton={true}
        onMax={handleMax}
        suffix="LP"
        disabled={isLoading || isTransacting}
      />

      <div className="lp-stake__actions">
        <Button
          onClick={handleStake}
          disabled={!isValidAmount || isLoading || isTransacting}
          loading={isTransacting}
          fullWidth={true}
        >
          Approve &amp; Stake $EGG-MOTO LP
        </Button>

        <TransactionStatus state={txState} />
      </div>
    </div>
  );
}

export { LPStake };
export type { LPStakeProps };
