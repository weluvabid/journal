/** Append one decimal digit to an in-progress card-navigation sequence. */
export function appendNavigationDigit(current: string, digit: string, maxDigits = 6): string {
  if (!/^\d$/u.test(digit)) {
    throw new TypeError(`Expected a decimal digit; received ${digit}`);
  }

  if (!Number.isSafeInteger(maxDigits) || maxDigits < 1) {
    throw new RangeError(`maxDigits must be a positive safe integer; received ${maxDigits}`);
  }

  if (current.length >= maxDigits) {
    return current;
  }

  return `${current}${digit}`;
}

/** Resolve a 1-based card number to a 0-based index, or null when invalid. */
export function resolveNavigationIndex(value: string, itemCount: number): number | null {
  if (!Number.isSafeInteger(itemCount) || itemCount < 0) {
    throw new RangeError(`itemCount must be a non-negative safe integer; received ${itemCount}`);
  }

  if (!/^\d+$/u.test(value)) {
    return null;
  }

  const oneBased = Number(value);

  if (!Number.isSafeInteger(oneBased) || oneBased < 1 || oneBased > itemCount) {
    return null;
  }

  return oneBased - 1;
}
