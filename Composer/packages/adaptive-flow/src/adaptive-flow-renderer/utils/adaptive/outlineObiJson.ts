// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../../constants/AdaptiveKinds';

const DEFAULT_CHILDREN_KEYS = [AdaptiveFieldNames.Actions];
const childrenMap = {
  [AdaptiveKinds.AdaptiveDialog]: [AdaptiveFieldNames.Actions],
  [AdaptiveKinds.IfCondition]: [AdaptiveFieldNames.Actions, AdaptiveFieldNames.ElseActions],
  [AdaptiveKinds.SwitchCondition]: [AdaptiveFieldNames.Cases, AdaptiveFieldNames.DefaultCase],
  'Microsoft.VirtualAgents.Question': ['cases'],
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
