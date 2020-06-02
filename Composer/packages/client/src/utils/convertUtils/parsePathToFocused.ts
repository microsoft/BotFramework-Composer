// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldNames } from '@bfc/shared';
import values from 'lodash/values';

import { parsePathToSelected } from './parsePathToSelected';

export function parsePathToFocused(path: string): string {
  //path is like main.triggers[0].actions[0]

  const trigger = parsePathToSelected(path);

  const list = path.split('.');

  const matchActions = list.filter((x) => {
    if (/\[|\]/.test(x)) {
      const reg = /\[.*\]/;
      x = x.replace(reg, '');
      return x !== FieldNames.Events && values(FieldNames).indexOf(x) > -1;
    }

    return false;
  });

  if (matchActions.length > 0) {
    return `${trigger}.${matchActions.join('.')}`;
  }
  return '';
}
