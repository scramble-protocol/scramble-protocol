import type { ReactElement } from 'react';
import { FormatService } from '../../services/FormatService.js';
import '../../styles/components/harvest-history.css';

interface HarvestEntry {
  readonly txId: string;
  readonly amount: bigint;
  readonly block: bigint;
  readonly bounty: bigint;
}

interface HarvestHistoryProps {
  readonly harvests: ReadonlyArray<HarvestEntry>;
}

function truncateTxId(txId: string): string {
  if (txId.length <= 16) {
    return txId;
  }
  return `${txId.slice(0, 8)}...${txId.slice(-8)}`;
}

function HarvestHistory({ harvests }: HarvestHistoryProps): ReactElement {
  if (harvests.length === 0) {
    return (
      <div className="harvest-history">
        <p className="harvest-history__empty">No harvests yet</p>
      </div>
    );
  }

  return (
    <div className="harvest-history">
      <div className="harvest-history__table-wrapper">
        <table className="harvest-history__table">
          <thead>
            <tr>
              <th className="harvest-history__th">Block</th>
              <th className="harvest-history__th">Amount</th>
              <th className="harvest-history__th">Bounty</th>
              <th className="harvest-history__th">Tx</th>
            </tr>
          </thead>
          <tbody>
            {harvests.map(function (entry: HarvestEntry): ReactElement {
              return (
                <tr key={entry.txId} className="harvest-history__tr">
                  <td className="harvest-history__td">
                    {entry.block.toString()}
                  </td>
                  <td className="harvest-history__td">
                    {FormatService.formatBigIntWithDecimals(entry.amount, 8, 4)}
                  </td>
                  <td className="harvest-history__td">
                    {FormatService.formatBigIntWithDecimals(entry.bounty, 8, 4)}
                  </td>
                  <td className="harvest-history__td">
                    <a
                      className="harvest-history__link"
                      href={`https://explorer.opnet.org/tx/${entry.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {truncateTxId(entry.txId)}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="harvest-history__cards">
        {harvests.map(function (entry: HarvestEntry): ReactElement {
          return (
            <div key={entry.txId} className="harvest-history__card">
              <p className="harvest-history__card-label">Block</p>
              <p className="harvest-history__card-value">
                {entry.block.toString()}
              </p>
              <p className="harvest-history__card-label">Amount</p>
              <p className="harvest-history__card-value">
                {FormatService.formatBigIntWithDecimals(entry.amount, 8, 4)}
              </p>
              <p className="harvest-history__card-label">Bounty</p>
              <p className="harvest-history__card-value">
                {FormatService.formatBigIntWithDecimals(entry.bounty, 8, 4)}
              </p>
              <p className="harvest-history__card-label">Tx</p>
              <p className="harvest-history__card-value">
                <a
                  className="harvest-history__link"
                  href={`https://explorer.opnet.org/tx/${entry.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {truncateTxId(entry.txId)}
                </a>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { HarvestHistory };
export type { HarvestHistoryProps };
