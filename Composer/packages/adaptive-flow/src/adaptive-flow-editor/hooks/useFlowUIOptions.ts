// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useShellApi, useFlowConfig } from '@bfc/extension';

export function useFlowUIOptions() {
  const { plugins } = useShellApi();
  const schema = useFlowConfig();

  return { widgets: plugins.flowWidgets ?? {}, schema };
}
