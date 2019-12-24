// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parsePathToSelected } from './parsePathToSelected';

export function parsePathToFocused(path: string): string {
  //path is like main.trigers[0].actions[0]

  const trigger = parsePathToSelected(path);

  const actionPatt = /actions\[(\d+)\]/g;
  let temp: RegExpExecArray | null = null;
  const matchActions: string[] = [];
  while ((temp = actionPatt.exec(path)) !== null) {
    matchActions.push(`actions[${+temp[1]}]`);
  }
  if (matchActions.length > 0) {
    return trigger + '.' + matchActions.join('.');
  }
  return '';
}
