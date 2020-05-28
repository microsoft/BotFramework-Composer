// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';

const DEFAULT_CHILDREN_KEYS = [ObiFieldNames.Actions];
const childrenMap = {
  [ObiTypes.AdaptiveDialog]: [ObiFieldNames.Actions],
  [ObiTypes.IfCondition]: [ObiFieldNames.Actions, ObiFieldNames.ElseActions],
  [ObiTypes.SwitchCondition]: [ObiFieldNames.Cases, ObiFieldNames.DefaultCase],
};

export function outlineObiJson(input: any) {
  if (!input) return {};

  const outline: any = {};
  let childrenKeys = DEFAULT_CHILDREN_KEYS;
  if (input.$kind && childrenMap[input.$kind]) {
    childrenKeys = childrenMap[input.$kind];
  }

  outline.$kind = input.$kind;

  for (const childrenKey of childrenKeys) {
    const children = input[childrenKey];
    if (Array.isArray(children)) {
      outline[childrenKey] = children.map((x) => outlineObiJson(x));
    } else {
      outline[childrenKey] = [];
    }
  }
  return outline;
}
