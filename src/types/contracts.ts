export interface VaultPosition {
  readonly yolks: bigint;
  readonly eggBoost: bigint;
  readonly depositBlock: bigint;
  readonly cookLevel: number;
  readonly pendingSizzle: bigint;
}

export interface VaultStats {
  readonly tvl: bigint;
  readonly totalYolks: bigint;
  readonly butterLevel: bigint;
  readonly sizzleRate: bigint;
}

export interface StakingPosition {
  readonly staked: bigint;
  readonly pendingRewards: bigint;
}

export interface MintStatus {
  readonly claimed: boolean;
  readonly totalClaimed: bigint;
  readonly maxClaims: bigint;
}

export interface FarmPosition {
  readonly staked: bigint;
  readonly pendingEgg: bigint;
}

export interface HarvestInfo {
  readonly pendingAmount: bigint;
  readonly bountyPercent: bigint;
  readonly lastHarvestBlock: bigint;
}
