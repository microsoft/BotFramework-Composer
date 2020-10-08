// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { MicrosoftIDialog } from '@bfc/types';

import { walkAdaptiveAction } from './walkAdaptiveAction';
export const walkAdaptiveActionList = (inputs: MicrosoftIDialog[], visit: (action: MicrosoftIDialog) => void): void => {
  if (Array.isArray(inputs)) {
    inputs.forEach((action) => walkAdaptiveAction(action, visit));
  }
};
