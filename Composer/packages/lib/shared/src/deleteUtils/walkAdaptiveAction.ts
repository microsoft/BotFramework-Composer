// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog, SDKTypes } from '../types';

import { walkIfCondition } from './walkIfCondition';
import { walkSwitchCondition } from './walkSwitchCondition';
import { walkActionWithChildren } from './walkActionWithChildren';
import { AdaptiveActionVisitor } from './AdaptiveActionVisitor';

const WalkerMap: { [$type: string]: (input, visitor: AdaptiveActionVisitor) => void } = {
  [SDKTypes.IfCondition]: walkIfCondition,
  [SDKTypes.SwitchCondition]: walkSwitchCondition,
  [SDKTypes.Foreach]: walkActionWithChildren,
  [SDKTypes.ForeachPage]: walkActionWithChildren,
  [SDKTypes.EditActions]: walkActionWithChildren,
};

export const walkAdaptiveAction = (input, visit: (action: MicrosoftIDialog) => void): void => {
  if (typeof input === 'string') {
    visit(input);
    return;
  }

  if (!input || !input.$type) {
    return;
  }

  if (WalkerMap[input.$type]) {
    WalkerMap[input.$type](input, visit);
  } else {
    visit(input);
  }
  return;
};
