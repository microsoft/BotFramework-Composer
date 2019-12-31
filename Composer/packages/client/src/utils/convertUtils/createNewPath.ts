// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FieldNames } from '@bfc/shared';

//convert dialog jsonpath#type to focusedPath#type#property
export const createNewPath = (path?: string): string | undefined => {
  if (!path) return path;
  const splitList = path.split('#');
  const type = splitList[1];
  path = splitList[0];
  const steps = [FieldNames.Events, FieldNames.Actions, FieldNames.ElseActions];
  let list = path.split('.');
  const matches = list.filter(x => !steps.every(step => !x.startsWith(step)));

  const focused = matches.join('.');
  list = path.split(`${focused}.`);
  if (list.length !== 2) return path;

  return `${list[0]}${focused}#${type}#${list[1]}`;
};
