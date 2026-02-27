/**
 * Raw contract call utilities for Scramble custom contracts.
 *
 * Scramble contracts use @method() WITHOUT @params decorators, so their
 * on-chain selectors are SHA256("methodName()") regardless of actual
 * parameter types.  The standard getContract proxy computes selectors
 * from ABI inputs (e.g. SHA256("deposit(uint256)")), producing a
 * different selector that the contract doesn't recognise.
 *
 * These helpers bypass the proxy and build calldata with the correct
 * selector, encoding parameters manually via BinaryWriter.
 */

import { ABICoder, BinaryWriter, BinaryReader, Address } from '@btc-vision/transaction';
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
  signature: string,
  encodeParams?: (writer: BinaryWriter) => void,
): Uint8Array {
  const selector = computeSelector(signature);
  const writer = new BinaryWriter();
  writer.writeSelector(selector);
  if (encodeParams) {
    encodeParams(writer);
  }
  return writer.getBuffer();
}

/**
 * Simulate a view (constant) call with a bare-name selector.
 * Returns a BinaryReader over the raw result bytes.
 * Throws on revert or RPC error.
 */
async function rawView(
  provider: JSONRpcProvider,
  contractAddr: string,
  sender: Address,
  signature: string,
  encodeParams?: (writer: BinaryWriter) => void,
): Promise<BinaryReader> {
  const buffer = buildCalldata(signature, encodeParams);
  const contractAddress = Address.fromString(contractAddr);

  const response = await provider.call(contractAddress, buffer, sender);

  if ('error' in response) {
    throw new Error(String((response as { error: unknown }).error));
  }

  const callResult = response as CallResult;
  return callResult.result as BinaryReader;
}

/**
 * Simulate a write (non-constant) call with a bare-name selector.
 * Returns a fully-initialised CallResult ready for sendTransaction().
 * Throws on revert or RPC error.
 */
async function rawWrite(
  provider: JSONRpcProvider,
  contractAddr: string,
  sender: Address,
  signature: string,
  network: Network,
  encodeParams?: (writer: BinaryWriter) => void,
): Promise<CallResult> {
  const buffer = buildCalldata(signature, encodeParams);
  const contractAddress = Address.fromString(contractAddr);

  const response = await provider.call(contractAddress, buffer, sender);

  if ('error' in response) {
    throw new Error(String((response as { error: unknown }).error));
  }

  const callResult = response as CallResult;

  callResult.setTo(contractAddress.p2op(network), contractAddress);
  callResult.setFromAddress(sender);
  callResult.setCalldata(buffer);
  callResult.constant = false;
  callResult.payable = false;

  const gasParameters = await provider.gasParameters();
  const gasPerSat = gasParameters.gasPerSat;
  const estimatedGas = callResult.estimatedGas ?? 0n;
  const refundedGas = callResult.refundedGas ?? 0n;

  const exactGas = (estimatedGas * gasPerSat) / 1_000_000_000_000n;
  const finalGas = (exactGas * 100n) / (100n - 15n);
  const exactRefund = (refundedGas * gasPerSat) / 1_000_000_000_000n;
  const finalRefund = (exactRefund * 100n) / (100n - 15n);

  callResult.setGasEstimation(
    finalGas > 297n ? finalGas : 297n,
    finalRefund > 297n ? finalRefund : 297n,
  );
  callResult.setBitcoinFee(gasParameters.bitcoin);

  return callResult;
}

export { rawView, rawWrite };
