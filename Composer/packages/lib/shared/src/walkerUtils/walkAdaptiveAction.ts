// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog, SDKKinds } from '@bfc/types';

import { walkIfCondition } from './walkIfCondition';
import { walkSwitchCondition } from './walkSwitchCondition';
import { walkActionWithChildren } from './walkActionWithChildren';
import { AdaptiveActionVisitor } from './AdaptiveActionVisitor';

const WalkerMap: { [$kind: string]: (input, visitor: AdaptiveActionVisitor) => void } = {
  [SDKKinds.IfCondition]: walkIfCondition,
  [SDKKinds.SwitchCondition]: walkSwitchCondition,
  [SDKKinds.Foreach]: walkActionWithChildren,
  [SDKKinds.ForeachPage]: walkActionWithChildren,
  [SDKKinds.EditActions]: walkActionWithChildren,
};

export const walkAdaptiveAction = (input, visit: (action: MicrosoftIDialog) => void): void => {
  if (typeof input === 'string') {
    visit(input);
    return;
  }

  if (!input || !input.$kind) {
    return;
  }

  if (WalkerMap[input.$kind]) {
    WalkerMap[input.$kind](input, visit);
  } else {
    visit(input);
  }
  return;
};
