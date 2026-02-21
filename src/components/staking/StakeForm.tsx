import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/stake-form.css';

interface StakeFormProps {
  readonly onStake: (amount: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly eggBalance: bigint;
  readonly isLoading: boolean;
}

function StakeForm({
  onStake,
  txState,
  eggBalance,
  isLoading,
}: StakeFormProps): ReactElement {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(amount, 8);
  const formattedBalance = FormatService.formatTokenAmount(eggBalance, 8);

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';
  const isDisabled = isLoading || isSubmitting || parsedAmount <= 0n || parsedAmount > eggBalance;

  function handleMaxClick(): void {
    setAmount(FormatService.formatTokenAmount(eggBalance, 8));
  }

  function handleStake(): void {
    void onStake(parsedAmount);
  }

  return (
    <Card title="Stake $EGG" subtitle="Stake $EGG to earn 5% of all Spatula harvests. Rewards are paid in MOTO.">
      <div className="stake-form">
        <div className="stake-form__balance">
          <span>Available Balance</span>
          <span className="stake-form__balance-value">
            {formattedBalance} EGG
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

        <div className="stake-form__actions">
          <Button
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isDisabled}
            onClick={handleStake}
          >
            Approve &amp; Stake
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { StakeForm };
export type { StakeFormProps };
