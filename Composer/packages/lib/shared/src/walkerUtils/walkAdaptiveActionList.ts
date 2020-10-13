// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog } from '@botframework-composer/types';

import { walkAdaptiveAction } from './walkAdaptiveAction';
import { AdaptiveActionVisitor } from './AdaptiveActionVisitor';

export const walkAdaptiveActionList = (inputs: MicrosoftIDialog[], visit: AdaptiveActionVisitor): void => {
  if (Array.isArray(inputs)) {
    inputs.forEach((action) => walkAdaptiveAction(action, visit));
  }
};
