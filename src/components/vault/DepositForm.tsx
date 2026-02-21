import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/deposit-form.css';

interface DepositFormProps {
  readonly onDeposit: (amount: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly motoBalance: bigint;
  readonly isLoading: boolean;
}

function DepositForm({
  onDeposit,
  txState,
  motoBalance,
  isLoading,
}: DepositFormProps): ReactElement {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(amount, 8);
  const formattedBalance = FormatService.formatTokenAmount(motoBalance, 8);
  const estimatedShells =
    amount.trim() !== ''
      ? FormatService.formatTokenAmount(parsedAmount, 8)
      : '0';

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';
  const isDisabled = isLoading || isSubmitting || parsedAmount <= 0n || parsedAmount > motoBalance;

  function handleMaxClick(): void {
    setAmount(FormatService.formatTokenAmount(motoBalance, 8));
  }

  function handleDeposit(): void {
    void onDeposit(parsedAmount);
  }

  return (
    <Card title="Deposit MOTO" subtitle="Deposit MOTO into The Pan to receive Shell Token — your proportional share of the vault.">
      <div className="deposit-form">
        <div className="deposit-form__balance">
          <span>Available Balance</span>
          <span className="deposit-form__balance-value">
            {formattedBalance} MOTO
          </span>
        </div>

        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          suffix="MOTO"
          maxButton
          onMax={handleMaxClick}
          disabled={isLoading || isSubmitting}
        />

        <div className="deposit-form__estimate">
          <span className="deposit-form__estimate-label">Estimated Shell Token</span>
          <span className="deposit-form__estimate-value">
            {estimatedShells} SHELL
          </span>
        </div>

        <div className="deposit-form__actions">
          <Button
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isDisabled}
            onClick={handleDeposit}
          >
            Approve &amp; Deposit
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { DepositForm };
export type { DepositFormProps };
