function addCommas(numStr: string): string {
  const chars = numStr.split('');
  const result: string[] = [];
  let count = 0;

  for (let i = chars.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result.push(',');
    }
    result.push(chars[i] ?? '');
    count++;
  }

  return result.reverse().join('');
}

function formatAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  const first = address.slice(0, 6);
  const last = address.slice(-4);
  return `${first}...${last}`;
}

function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  const wholeStr = addCommas(
    (wholePart < 0n ? -wholePart : wholePart).toString(),
  );
  const sign = amount < 0n ? '-' : '';

  if (fractionalPart === 0n) {
    return `${sign}${wholeStr}`;
  }

  const absFractional =
    fractionalPart < 0n ? -fractionalPart : fractionalPart;
  const fractionalStr = absFractional.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.replace(/0+$/, '');

  return `${sign}${wholeStr}.${trimmed}`;
}

function parseTokenAmount(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (trimmed === '') {
    return 0n;
  }

  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1).replaceAll(',', '') : trimmed.replaceAll(',', '');
  const parts = unsigned.split('.');
  const wholePart = parts[0] ?? '0';
  const fractionalPart = parts[1] ?? '';

  const paddedFractional = fractionalPart
    .slice(0, decimals)
    .padEnd(decimals, '0');

  const wholeValue = BigInt(wholePart) * 10n ** BigInt(decimals);
  const fractionalValue = BigInt(paddedFractional);
  const result = wholeValue + fractionalValue;

  return negative ? -result : result;
}

function formatBlocksRemaining(blocks: bigint): string {
  const minutes = blocks * 10n;
  return `${blocks.toString()} blocks (~${minutes.toString()} min)`;
}

function formatBigIntWithDecimals(
  value: bigint,
  decimals: number,
  displayDecimals?: number,
): string {
  const formatted = formatTokenAmount(value, decimals);

  if (displayDecimals === undefined) {
    return formatted;
  }

  const dotIndex = formatted.indexOf('.');
  if (dotIndex === -1) {
    if (displayDecimals === 0) {
      return formatted;
    }
    return `${formatted}.${'0'.repeat(displayDecimals)}`;
  }

  const integerPart = formatted.slice(0, dotIndex);
  const decimalPart = formatted.slice(dotIndex + 1);

  if (displayDecimals === 0) {
    return integerPart;
  }

  const truncated = decimalPart
    .slice(0, displayDecimals)
    .padEnd(displayDecimals, '0');
  return `${integerPart}.${truncated}`;
}

const FormatService = {
  formatAddress,
  formatTokenAmount,
  parseTokenAmount,
  formatBlocksRemaining,
  formatBigIntWithDecimals,
} as const;

export { FormatService };
