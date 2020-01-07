// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldNames } from '@bfc/shared';

import { parsePathToSelected } from './parsePathToSelected';

export function parsePathToFocused(path: string): string {
  //path is like main.triggers[0].actions[0]

  const trigger = parsePathToSelected(path);

  const list = path.split('.');

  const matchActions = list.filter(x => x.startsWith(FieldNames.Actions) || x.startsWith(FieldNames.ElseActions));

  if (matchActions.length > 0) {
    return `${trigger}.${matchActions.join('.')}`;
  }
  return '';
}
