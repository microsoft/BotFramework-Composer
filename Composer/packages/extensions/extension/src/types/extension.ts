// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { RecognizerSchema, UIOptions } from './formSchema';
import { FlowEditorWidgetMap, FlowWidget } from './flowSchema';
import { MenuOptions } from './menuSchema';

export interface PluginConfig {
  recognizers?: RecognizerSchema[];
  uiSchema?: UISchema;
  flowWidgets?: FlowEditorWidgetMap;
}

export type UISchema = {
  [key in SDKKinds]?: {
    flow?: FlowWidget;
    form?: UIOptions;
    menu?: MenuOptions;
  };
};
