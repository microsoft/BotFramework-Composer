// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PluginType } from '../types/pluginType';

type HookContext = 'project';

const pluginTypeToContextMap: { [key in PluginType]: HookContext[] } = {
  page: ['project'],
  publish: [],
  storage: ['project'],
  create: [],
};

export function validateHookContext(targetContext: HookContext) {
  // eslint-disable-next-line no-underscore-dangle
  const validContexts = pluginTypeToContextMap[window.Composer.__pluginType] ?? [];

  if (!validContexts.includes(targetContext)) {
    const msg = Object.entries(pluginTypeToContextMap)
      .reduce((types, [type, ctxs]) => {
        if (ctxs.includes(targetContext)) {
          types.push(`- ${type}`);
        }

        return types;
      }, [] as string[])
      .join('\n');
    throw Error(`Invalid use of ${targetContext} api. Only available in these contexts:\n${msg}`);
  }
}
