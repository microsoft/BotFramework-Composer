// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/**
 * @param input '(1,2,3)'
 * @returns ['1', '2', '3']
 */
export default function parseLgParamString(input: string): string[] | undefined {
  if (!input) return undefined;

  const results = /^\((.*)\)$/.exec(input);
  if (Array.isArray(results) && results.length === 2) {
    return results[1] ? results[1].split(',') : [];
  }
  return undefined;
}
