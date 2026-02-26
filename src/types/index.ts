export type TransactionStatus =
  | 'idle'
  | 'approving'
  | 'confirming'
  | 'simulating'
  | 'signing'
  | 'broadcasting'
  | 'confirmed'
  | 'error';

export interface TransactionState {
  readonly status: TransactionStatus;
  readonly txId?: string;
  readonly error?: string;
  readonly message?: string;
}

export * from './contracts.js';
