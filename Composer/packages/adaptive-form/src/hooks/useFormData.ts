// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useMemo } from 'react';
import get from 'lodash/get';
import { useShellApi, MicrosoftIDialog } from '@bfc/extension-client';

/**
 * Returns data for current form context
 */
export function useFormData() {
  const { ...shellData } = useShellApi();
  const { currentDialog, focusedSteps } = shellData;

  return useMemo(() => {
    if (currentDialog?.content) {
      return focusedSteps[0] ? get(currentDialog.content, focusedSteps[0]) : currentDialog.content;
    } else {
      return {};
    }
  }, [currentDialog, focusedSteps[0]]) as MicrosoftIDialog;
}
