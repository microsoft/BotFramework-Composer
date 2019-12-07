// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/**
 * ['1', '2'] => '(1, 2)'
 */
export default function buildLgParamString(parameters: string[]): string {
  if (Array.isArray(parameters)) {
    return `(${parameters.join(',')})`;
  } else {
    return '()';
  }
}
