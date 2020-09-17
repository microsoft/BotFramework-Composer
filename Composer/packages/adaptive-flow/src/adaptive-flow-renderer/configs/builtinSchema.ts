// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';
import { FlowUISchema } from '@bfc/extension-client';

const builtinVisualSDKSchema: FlowUISchema = {
  default: {
    widget: 'ActionHeader',
  },
  custom: {
    widget: 'ActionHeader',
    colors: { theme: '#69797E', color: '#FFFFFF' },
  },
  [SDKKinds.IfCondition]: {
    widget: 'IfConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: '=coalesce(action.condition, "<condition>")',
    },
  },
  [SDKKinds.SwitchCondition]: {
    widget: 'SwitchConditionWidget',
    nowrap: true,
    judgement: {
      widget: 'ActionCard',
      body: '=coalesce(action.condition, "<condition>")',
    },
  },
  [SDKKinds.Foreach]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: '=concat("Each value in ", coalesce(action.itemsProperty, "?"))',
    },
  },
  [SDKKinds.ForeachPage]: {
    widget: 'ForeachWidget',
    nowrap: true,
    loop: {
      widget: 'ActionCard',
      body: '=concat("Each page of ", coalesce(action.pageSize, "?"), " in ", coalesce(action.page, "?"))',
    },
  },
};

export default builtinVisualSDKSchema;
