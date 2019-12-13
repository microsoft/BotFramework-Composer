// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function parsePathToFocused(path: string): string {
  //path is like main.trigers[0].actions[0]

  const list = path.split('.');

  if (list.length > 2) {
    list.shift();
    return list.join('.');
  }
  return '';
}
