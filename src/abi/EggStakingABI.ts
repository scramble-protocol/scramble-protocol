import type { BitcoinInterfaceAbi } from 'opnet';

// EggStaking uses raw contract calls via RawContractService
// because the deployed contract uses @method() without @params decorators,
// producing selectors like SHA256("stake()") instead of SHA256("stake(uint256)").
// The standard getContract ABI approach computes wrong selectors.
// See src/services/RawContractService.ts and src/hooks/useEggStaking.ts.
export const EGG_STAKING_ABI: BitcoinInterfaceAbi = [] as const;
