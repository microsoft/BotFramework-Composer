// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { parsePathToSelected } from './parsePathToSelected';

export function parsePathToFocused(path: string): string {
  //path is like main.triggers[0].actions[0]

  const trigger = parsePathToSelected(path);

  const list = path.split('.');

  const matchActions = list.filter(x => x.startsWith('actions') || x.startsWith('elseActions'));

  if (matchActions.length > 0) {
    return `${trigger}.${matchActions.join('.')}`;
  }
  return '';
}
