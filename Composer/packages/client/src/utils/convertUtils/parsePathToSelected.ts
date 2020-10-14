// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function parsePathToSelected(path: string): string {
  //path is like main.triggers[0].actions[0]

  const triggerPattern = /triggers\[(.+?)\]/g;
  const matchTriggers = triggerPattern.exec(path);

  const trigger = matchTriggers ? `triggers[${matchTriggers[1]}]` : '';

  return trigger;
}
