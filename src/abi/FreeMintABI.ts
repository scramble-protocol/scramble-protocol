import { ABIDataTypes, BitcoinAbiTypes, type BitcoinInterfaceAbi } from 'opnet';

export const FREE_MINT_ABI: BitcoinInterfaceAbi = [
  {
    name: 'claim',
    type: BitcoinAbiTypes.Function,
    inputs: [],
    outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
  },
  {
    name: 'remaining',
    type: BitcoinAbiTypes.Function,
    constant: true,
    inputs: [],
    outputs: [{ name: 'remaining', type: ABIDataTypes.UINT256 }],
  },
];
