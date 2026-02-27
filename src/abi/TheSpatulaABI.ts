import { ABIDataTypes, BitcoinAbiTypes, type BitcoinInterfaceAbi } from 'opnet';

export const THE_SPATULA_ABI: BitcoinInterfaceAbi = [
  {
    name: 'deposit',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'withdraw',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'withdrawAll',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'harvest',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'minAmountOut', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'amountOut', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'totalDeposited',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [],
    outputs: [{ name: 'totalDeposited', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'setPan',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'pan', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setEggStaking',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'eggStaking', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'transferOwnership',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'newOwner', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
];
