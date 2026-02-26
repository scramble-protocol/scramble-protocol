import { ABICoder, BinaryWriter, Address } from '@btc-vision/transaction';
import type { CallResult, JSONRpcProvider } from 'opnet';
import type { Network } from '@btc-vision/bitcoin';

const abiCoder = new ABICoder();

function computeSelector(signature: string): number {
  const hex = abiCoder.encodeSelector(signature);
  if (hex.includes(',')) {
    const bytes = hex.split(',').map((s: string) => Number(s));
    const hexStr = bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    return Number('0x' + hexStr);
  }
  return Number('0x' + hex);
}

function buildCalldata(
  methodName: string,
  encodeParams?: (writer: BinaryWriter) => void,
): Uint8Array {
  const selector = computeSelector(methodName + '()');
  const writer = new BinaryWriter();
  writer.writeSelector(selector);
  if (encodeParams) {
    encodeParams(writer);
  }
  return writer.getBuffer();
}

/**
 * Read-only contract call. Returns CallResult with `result` BinaryReader
 * for decoding (readU256, readBoolean, readAddress, etc.).
 */
export async function callView(
  provider: JSONRpcProvider,
  contractAddr: string,
  senderAddr: Address,
  methodName: string,
  encodeParams?: (writer: BinaryWriter) => void,
): Promise<CallResult> {
  const contractAddress = Address.fromString(contractAddr);
  const buffer = buildCalldata(methodName, encodeParams);

  const response = await provider.call(contractAddress, buffer, senderAddr);

  if ('error' in response) {
    throw new Error(`Raw call failed: ${String(response.error)}`);
  }

  return response as CallResult;
}

/**
 * Write contract call. Sets up CallResult for sendTransaction()
 * with gas estimation, fees, to/from addresses.
 */
export async function callWrite(
  provider: JSONRpcProvider,
  contractAddr: string,
  senderAddr: Address,
  network: Network,
  methodName: string,
  encodeParams?: (writer: BinaryWriter) => void,
): Promise<CallResult> {
  const contractAddress = Address.fromString(contractAddr);
  const buffer = buildCalldata(methodName, encodeParams);

  const response = await provider.call(contractAddress, buffer, senderAddr);

  if ('error' in response) {
    throw new Error(`Raw call simulation failed: ${String(response.error)}`);
  }

  const callResult = response as CallResult;
  callResult.setTo(contractAddress.p2op(network), contractAddress);
  callResult.setFromAddress(senderAddr);
  callResult.setCalldata(buffer);
  callResult.constant = false;
  callResult.payable = false;

  const gasParameters = await provider.gasParameters();
  const gasPerSat = gasParameters.gasPerSat;
  const estimatedGas = callResult.estimatedGas ?? 0n;
  const refundedGas = callResult.refundedGas ?? 0n;
  const exactGas = (estimatedGas * gasPerSat) / 1000000000000n;
  const finalGas = (exactGas * 100n) / (100n - 15n);
  const exactRefund = (refundedGas * gasPerSat) / 1000000000000n;
  const finalRefund = (exactRefund * 100n) / (100n - 15n);
  callResult.setGasEstimation(
    finalGas > 297n ? finalGas : 297n,
    finalRefund > 297n ? finalRefund : 297n,
  );
  callResult.setBitcoinFee(gasParameters.bitcoin);

  return callResult;
}

export { BinaryWriter } from '@btc-vision/transaction';
