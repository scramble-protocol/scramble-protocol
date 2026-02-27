import { ABIDataTypes, BitcoinAbiTypes, OP_20_ABI, type BitcoinInterfaceAbi } from 'opnet';

export const THE_PAN_ABI: BitcoinInterfaceAbi = [
  ...OP_20_ABI,
  {
    name: 'deposit',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'shares', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'withdraw',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'shares', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'received', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'claimSizzle',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'claimed', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'depositEggBoost',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'withdrawEggBoost',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'receiveYield',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'pendingSizzle',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [{ name: 'user', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'pending', type: ABIDataTypes.UINT256 }],
  },
  {
    name: 'proposeSpatula',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'newSpatula', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'executeSpatula',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setButterTarget',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'newTarget', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'setPaused',
    type: BitcoinAbiTypes.Function,
    inputs: [{ name: 'state', type: ABIDataTypes.BOOL }],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
];
