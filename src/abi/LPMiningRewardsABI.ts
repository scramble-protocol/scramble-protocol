import { ABIDataTypes, BitcoinAbiTypes, type BitcoinInterfaceAbi } from 'opnet';

export const LP_MINING_REWARDS_ABI: BitcoinInterfaceAbi = [
  {
    name: 'stake',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'unstake',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'claimReward',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'proposeEmissionPeriod',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'amount', type: ABIDataTypes.UINT256 },
      { name: 'durationBlocks', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'executeEmissionPeriod',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'totalStaked',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [],
    outputs: [{ name: 'totalStaked', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'pendingReward',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [{ name: 'user', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'pending', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'stakedBalance',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [{ name: 'user', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'balance', type: ABIDataTypes.UINT256 }],
  },
];
