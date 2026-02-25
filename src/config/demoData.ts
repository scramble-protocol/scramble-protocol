import type { TransactionState, VaultPosition, VaultStats, StakingPosition, FarmPosition, HarvestInfo, MintStatus } from '../types/index.js';

// --- Shared helpers ---

const DEMO_TX_ID = '0xaaabbbccc111222333444555666777888999000aaabbbccc111222333444555666';

function simulateTx(): Promise<TransactionState> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'confirmed', txId: DEMO_TX_ID });
    }, 1500);
  });
}

const noop = (): void => {};

// 18-decimal token helper: 1 token = 10^18
function tokens(n: number): bigint {
  return BigInt(n) * 10n ** 18n;
}

// --- useWallet ---

interface DemoWalletState {
  readonly address: string;
  readonly opnetAddress: null;
  readonly isConnected: boolean;
  readonly balance: bigint;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly network: string;
  readonly openConnectModal: () => void;
}

export const DEMO_WALLET: DemoWalletState = {
  address: 'bc1pdemo...xyz',
  opnetAddress: null,
  isConnected: true,
  balance: 500_000n, // 0.005 BTC in sats
  connect: noop,
  disconnect: noop,
  network: 'testnet',
  openConnectModal: noop,
};

// --- useBlockHeight ---

interface DemoBlockState {
  readonly blockHeight: bigint;
  readonly isLoading: boolean;
}

export const DEMO_BLOCK: DemoBlockState = {
  blockHeight: 15_000n,
  isLoading: false,
};

// --- useEggToken ---

interface DemoEggTokenState {
  readonly balance: bigint;
  readonly totalSupply: bigint;
  readonly increaseAllowance: (spender: string, amount: bigint) => Promise<TransactionState>;
  readonly isLoading: boolean;
}

export const DEMO_EGG_TOKEN: DemoEggTokenState = {
  balance: tokens(25_000),
  totalSupply: tokens(100_000_000),
  increaseAllowance: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
};

// --- useThePan ---

const demoPanPosition: VaultPosition = {
  shells: tokens(10),
  eggBoost: tokens(500),
  depositBlock: 10_000n,
  cookLevel: 2, // Over Easy (block 15,000 - 10,000 = 5,000 blocks in)
  pendingSizzle: tokens(42),
};

const demoPanStats: VaultStats = {
  tvl: tokens(1_250_000),
  totalShells: tokens(85_000),
  butterLevel: tokens(320),
  sizzleRate: tokens(15),
};

interface DemoThePanState {
  readonly position: VaultPosition;
  readonly stats: VaultStats;
  readonly deposit: (amount: bigint) => Promise<TransactionState>;
  readonly withdraw: (shares: bigint) => Promise<TransactionState>;
  readonly claimSizzle: () => Promise<TransactionState>;
  readonly depositEggBoost: (amount: bigint) => Promise<TransactionState>;
  readonly withdrawEggBoost: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export const DEMO_THE_PAN: DemoThePanState = {
  position: demoPanPosition,
  stats: demoPanStats,
  deposit: (): Promise<TransactionState> => simulateTx(),
  withdraw: (): Promise<TransactionState> => simulateTx(),
  claimSizzle: (): Promise<TransactionState> => simulateTx(),
  depositEggBoost: (): Promise<TransactionState> => simulateTx(),
  withdrawEggBoost: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
  txState: { status: 'idle' },
};

// --- useEggStaking ---

const demoStakingPosition: StakingPosition = {
  staked: tokens(5_000),
  pendingRewards: 12_500_000_000_000_000_000n, // 12.5 MOTO pending (12.5 * 10^18)
};

interface DemoEggStakingState {
  readonly position: StakingPosition;
  readonly stake: (amount: bigint) => Promise<TransactionState>;
  readonly unstake: (amount: bigint) => Promise<TransactionState>;
  readonly claimRewards: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export const DEMO_EGG_STAKING: DemoEggStakingState = {
  position: demoStakingPosition,
  stake: (): Promise<TransactionState> => simulateTx(),
  unstake: (): Promise<TransactionState> => simulateTx(),
  claimRewards: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
  txState: { status: 'idle' },
};

// --- useLPMining ---

const demoFarmPosition: FarmPosition = {
  staked: tokens(2_500),
  pendingEgg: tokens(180),
};

interface DemoLPMiningState {
  readonly position: FarmPosition;
  readonly stakeLP: (amount: bigint) => Promise<TransactionState>;
  readonly unstakeLP: (amount: bigint) => Promise<TransactionState>;
  readonly claimRewards: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export const DEMO_LP_MINING: DemoLPMiningState = {
  position: demoFarmPosition,
  stakeLP: (): Promise<TransactionState> => simulateTx(),
  unstakeLP: (): Promise<TransactionState> => simulateTx(),
  claimRewards: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
  txState: { status: 'idle' },
};

// --- useSpatula ---

const demoHarvestInfo: HarvestInfo = {
  pendingAmount: tokens(250),
  bountyPercent: 50n, // 0.5% stored as basis points
  lastHarvestBlock: 14_500n,
};

interface DemoSpatulaState {
  readonly harvestInfo: HarvestInfo;
  readonly harvest: (minAmountOut: bigint) => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export const DEMO_SPATULA: DemoSpatulaState = {
  harvestInfo: demoHarvestInfo,
  harvest: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
  txState: { status: 'idle' },
};

// --- useFreeMint ---

const demoMintStatus: MintStatus = {
  claimed: false,
  totalClaimed: 3_247n,
  maxClaims: 5_000n,
};

interface DemoFreeMintState {
  readonly mintStatus: MintStatus;
  readonly canClaim: boolean;
  readonly claim: () => Promise<TransactionState>;
  readonly isLoading: boolean;
  readonly txState: TransactionState;
}

export const DEMO_FREE_MINT: DemoFreeMintState = {
  mintStatus: demoMintStatus,
  canClaim: true,
  claim: (): Promise<TransactionState> => simulateTx(),
  isLoading: false,
  txState: { status: 'idle' },
};
