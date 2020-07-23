// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { RecognizerSchema, UIOptions } from './formSchema';
import { FlowEditorWidgetMap, FlowWidget } from './flowSchema';
import { MenuSchema } from './menu';

export interface PluginConfig {
  recognizers?: RecognizerSchema[];
  uiSchema?: UISchema;
  flowWidgets?: FlowEditorWidgetMap;
}

export type UISchema = {
  [key in SDKKinds]?: {
    flow?: FlowWidget;
    form?: UIOptions;
    menu?: MenuSchema;
  };
};
