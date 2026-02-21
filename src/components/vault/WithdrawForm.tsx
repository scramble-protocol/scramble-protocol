import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/withdraw-form.css';

interface WithdrawFormProps {
  readonly onWithdraw: (shares: bigint) => Promise<void>;
  readonly txState: TransactionState;
  readonly yolkBalance: bigint;
  readonly yokeTaxPercent: number;
  readonly isLoading: boolean;
}

function WithdrawForm({
  onWithdraw,
  txState,
  yolkBalance,
  yokeTaxPercent,
  isLoading,
}: WithdrawFormProps): ReactElement {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(amount, 8);
  const formattedBalance = FormatService.formatTokenAmount(yolkBalance, 8);

  const taxAmount = parsedAmount * BigInt(Math.round(yokeTaxPercent * 100)) / 10000n;
  const netAmount = parsedAmount - taxAmount;

  const formattedTax = FormatService.formatTokenAmount(taxAmount, 8);
  const formattedNet = FormatService.formatTokenAmount(netAmount > 0n ? netAmount : 0n, 8);

  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';
  const isDisabled = isLoading || isSubmitting || parsedAmount <= 0n || parsedAmount > yolkBalance;

  function handleMaxClick(): void {
    setAmount(FormatService.formatTokenAmount(yolkBalance, 8));
  }

  function handleWithdraw(): void {
    void onWithdraw(parsedAmount);
  }

  return (
    <Card title="Withdraw" subtitle="Return Yolks to withdraw MOTO. Yoke Tax applies based on blocks since deposit.">
      <div className="withdraw-form">
        <div className="withdraw-form__balance">
          <span>Your Yolks</span>
          <span className="withdraw-form__balance-value">
            {formattedBalance} Yolks
          </span>
        </div>

        <Input
          label="Yolks to Withdraw"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          suffix="Yolks"
          maxButton
          onMax={handleMaxClick}
          disabled={isLoading || isSubmitting}
        />

        <div className="withdraw-form__tax-preview">
          <div className="withdraw-form__tax-row">
            <span className="withdraw-form__tax-label">Yoke Tax</span>
            <span className="withdraw-form__tax-value withdraw-form__tax-value--warning">
              {String(yokeTaxPercent)}% ({formattedTax} MOTO)
            </span>
          </div>
          <hr className="withdraw-form__divider" />
          <div className="withdraw-form__tax-row">
            <span className="withdraw-form__tax-label">Net MOTO Received</span>
            <span className="withdraw-form__tax-value withdraw-form__tax-value--success">
              {formattedNet} MOTO
            </span>
          </div>
        </div>

        <div className="withdraw-form__actions">
          <Button
            variant="danger"
            fullWidth
            loading={isSubmitting}
            disabled={isDisabled}
            onClick={handleWithdraw}
          >
            Withdraw
          </Button>

          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { WithdrawForm };
export type { WithdrawFormProps };
