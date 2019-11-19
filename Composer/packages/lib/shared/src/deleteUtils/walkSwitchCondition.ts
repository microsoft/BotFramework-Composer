// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { AdaptiveActionVisitor } from './AdaptiveActionVisitor';
import { walkAdaptiveActionList } from './walkAdaptiveActionList';

export const walkSwitchCondition = (input, visitor: AdaptiveActionVisitor) => {
  visitor(input);

  walkAdaptiveActionList(input.default, visitor);

  if (Array.isArray(input.cases)) {
    input.cases.forEach(currentCase => {
      walkAdaptiveActionList(currentCase.actions, visitor);
    });
  }
};
