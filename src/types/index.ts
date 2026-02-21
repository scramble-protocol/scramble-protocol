export type TransactionStatus =
  | 'idle'
  | 'approving'
  | 'simulating'
  | 'signing'
  | 'broadcasting'
  | 'confirmed'
  | 'error';

export interface TransactionState {
  readonly status: TransactionStatus;
  readonly txId?: string;
  readonly error?: string;
}

export * from './contracts.js';
