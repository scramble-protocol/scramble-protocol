import { useMemo } from 'react';

interface AddressValidationState {
  readonly isValid: boolean;
  readonly error: string | undefined;
}

const BECH32_MAINNET_REGEX = /^bc1[a-zA-HJ-NP-Z0-9]{25,62}$/;
const BECH32_REGTEST_REGEX = /^bcrt1[a-zA-HJ-NP-Z0-9]{25,62}$/;

export function useAddressValidation(address: string): AddressValidationState {
  const validationResult = useMemo((): AddressValidationState => {
    if (!address || address.length === 0) {
      return { isValid: false, error: 'Address is required' };
    }

    const trimmed = address.trim();

    if (trimmed.length < 14) {
      return { isValid: false, error: 'Address is too short' };
    }

    if (trimmed.length > 74) {
      return { isValid: false, error: 'Address is too long' };
    }

    if (BECH32_MAINNET_REGEX.test(trimmed) || BECH32_REGTEST_REGEX.test(trimmed)) {
      return { isValid: true, error: undefined };
    }

    return {
      isValid: false,
      error: 'Invalid Bitcoin address format. Expected bech32 address starting with bc1 or bcrt1',
    };
  }, [address]);

  return validationResult;
}
