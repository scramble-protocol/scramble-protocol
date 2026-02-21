import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/unstake-form.css';

interface UnstakeFormProps {
  readonly onUnstake: (amount: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly stakedAmount: bigint;
  readonly isLoading: boolean;
}

function UnstakeForm({
  onUnstake,
  txState,
  stakedAmount,
  isLoading,
}: UnstakeFormProps): ReactElement {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(amount, 8);
  const formattedStaked = FormatService.formatTokenAmount(stakedAmount, 8);

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';
  const isDisabled = isLoading || isSubmitting || parsedAmount <= 0n || parsedAmount > stakedAmount;

  function handleMaxClick(): void {
    setAmount(FormatService.formatTokenAmount(stakedAmount, 8));
  }

  function handleUnstake(): void {
    void onUnstake(parsedAmount);
  }

  return (
    <Card title="Unstake $EGG" subtitle="Unstake anytime — no lock-up period">
      <div className="unstake-form">
        <div className="unstake-form__balance">
          <span>Currently Staked</span>
          <span className="unstake-form__balance-value">
            {formattedStaked} EGG
          </span>
        </div>

        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          suffix="EGG"
          maxButton
          onMax={handleMaxClick}
          disabled={isLoading || isSubmitting}
        />

        <div className="unstake-form__actions">
          <Button
            variant="secondary"
            fullWidth
            loading={isSubmitting}
            disabled={isDisabled}
            onClick={handleUnstake}
          >
            Unstake
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { UnstakeForm };
export type { UnstakeFormProps };
