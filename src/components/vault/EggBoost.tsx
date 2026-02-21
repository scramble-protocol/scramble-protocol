import { useState } from 'react';
import type { ReactElement } from 'react';
import type { TransactionState } from '../../types/index.js';
import { Button, Card, Input, TransactionStatus } from '../common/index.js';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/egg-boost.css';

interface EggBoostProps {
  readonly currentBoost: bigint;
  readonly eggBalance: bigint;
  readonly onDeposit: (amount: bigint) => Promise<void>;
  readonly onWithdraw: () => Promise<void>;
  readonly txState: TransactionState;
}

function EggBoost({
  currentBoost,
  eggBalance,
  onDeposit,
  onWithdraw,
  txState,
}: EggBoostProps): ReactElement {
  const [amount, setAmount] = useState<string>('');

  const parsedAmount = FormatService.parseTokenAmount(amount, 8);
  const formattedBoost = FormatService.formatTokenAmount(currentBoost, 8);
  const formattedBalance = FormatService.formatTokenAmount(eggBalance, 8);

  const hasBoost = currentBoost > 0n;
  const isSubmitting = txState.status !== 'idle' && txState.status !== 'confirmed' && txState.status !== 'error';
  const isDepositDisabled = isSubmitting || parsedAmount <= 0n || parsedAmount > eggBalance;
  const isWithdrawDisabled = isSubmitting || !hasBoost;

  function handleMaxClick(): void {
    setAmount(FormatService.formatTokenAmount(eggBalance, 8));
  }

  function handleDeposit(): void {
    void onDeposit(parsedAmount);
  }

  function handleWithdraw(): void {
    void onWithdraw();
  }

  return (
    <Card title="$EGG Boost" subtitle="Deposit $EGG alongside your Pan deposit for +0.25x Cook Level bonus." glow={hasBoost ? 'egg' : 'none'}>
      <div className="egg-boost">
        <div className="egg-boost__current">
          <p className="egg-boost__current-label">Current Boost</p>
          <p className="egg-boost__current-value">
            {formattedBoost} EGG
          </p>
        </div>

        <div className="egg-boost__balance">
          <span>Wallet Balance</span>
          <span className="egg-boost__balance-value">
            {formattedBalance} EGG
          </span>
        </div>

        <Input
          label="$EGG Amount"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          suffix="EGG"
          maxButton
          onMax={handleMaxClick}
          disabled={isSubmitting}
        />

        <div className="egg-boost__buttons">
          <Button
            variant="primary"
            loading={isSubmitting}
            disabled={isDepositDisabled}
            onClick={handleDeposit}
          >
            Deposit $EGG Boost
          </Button>

          <Button
            variant="secondary"
            loading={isSubmitting}
            disabled={isWithdrawDisabled}
            onClick={handleWithdraw}
          >
            Withdraw Boost
          </Button>
        </div>

        <div className="egg-boost__actions">
          <TransactionStatus state={txState} />
        </div>
      </div>
    </Card>
  );
}

export { EggBoost };
export type { EggBoostProps };
