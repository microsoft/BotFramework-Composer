// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useShellApi, useFlowConfig } from '@bfc/extension';
export function useFlowUIOptions() {
  var _a;
  var plugins = useShellApi().plugins;
  var schema = useFlowConfig();
  return { widgets: (_a = plugins.flowWidgets) !== null && _a !== void 0 ? _a : {}, schema: schema };
}
//# sourceMappingURL=useFlowUIOptions.js.map
