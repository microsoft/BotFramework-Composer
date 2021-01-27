// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

// TODO (zeye): define triggers compatibility in sdk schema
/**
 * Returns 'false' if recognizer and trigger is not compatible.
 */
export const checkRecognizerCompatibility = (triggerType: SDKKinds, recognizerType?: SDKKinds): boolean => {
  if (recognizerType === SDKKinds.RegexRecognizer) {
    if (triggerType === SDKKinds.OnQnAMatch) return false;
    if (triggerType === SDKKinds.OnChooseIntent) return false;
  }
  return true;
};
