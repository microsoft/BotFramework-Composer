// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/types';

import { UIOptions } from './formSchema';
import { FlowEditorWidgetMap, FlowWidget } from './flowSchema';
import { MenuOptions } from './menuSchema';
import { RecognizerOptions } from './recognizerSchema';
import { FieldWidget } from './form';

export interface PluginConfig {
  uiSchema?: UISchema;
  widgets?: {
    flow?: FlowEditorWidgetMap;
    recognizer?: { [name: string]: FieldWidget };
  };
}

export type UISchema = {
  [key in SDKKinds]?: {
    flow?: FlowWidget;
    form?: UIOptions;
    menu?: MenuOptions | MenuOptions[];
    recognizer?: RecognizerOptions;
  };
};
