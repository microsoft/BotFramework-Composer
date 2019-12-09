// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parsePathToSelected } from './parsePathToSelected';

export function parsePathToFocused(path: string): string {
  //path is like main.trigers[0].actions[0]

  const actionPattern = /actions\[(\d+)\]/g;

  const trigger = parsePathToSelected(path);

  let actions = '';

  if (!trigger) return actions;

  let temp: RegExpExecArray | null = null;
  while ((temp = actionPattern.exec(path)) !== null) {
    if (!actions) actions = trigger;
    actions += `.actions[${+temp[1]}]`;
  }

  return actions;
}
