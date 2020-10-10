// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/types';

import { UIOptions } from './formSchema';
import { FlowEditorWidgetMap, FlowWidget } from './flowSchema';
import { MenuOptions } from './menuSchema';
import { RecognizerOptions } from './recognizerSchema';

export interface PluginConfig {
  uiSchema?: UISchema;
  flowWidgets?: FlowEditorWidgetMap;
}

export type UISchema = {
  [key in SDKKinds]?: {
    flow?: FlowWidget;
    form?: UIOptions;
    menu?: MenuOptions | MenuOptions[];
    recognizer?: RecognizerOptions;
  };
};
