// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function addEqualPrefix(first: string, second: string): string {
  let result = first;

  if (second.trimLeft().indexOf('=') === 0) {
    const treatedStr = second
      .trimLeft()
      .slice(1)
      .trimLeft();
    result = result + ' = ' + treatedStr;
  } else {
    result = result + ' = ' + second;
  }
  return result;
}
