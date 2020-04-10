// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, ComponentClass } from 'react';
import { BaseSchema, SDKKinds } from '@bfc/shared';

export interface VisualEditorConfig {
  widgets?: VisualEditorWidgetMap;
  schema?: VisualSchema;
}

export type VisualEditorWidgetMap = { [widgetName: string]: WidgetComponent<any> };
export enum VisualSchemaBuiltinKeys {
  default = 'default',
}

/** schema */
export type VisualSchema = {
  [key in SDKKinds | VisualSchemaBuiltinKeys]?: VisualWidget;
};

export interface VisualWidget {
  /** Widget implementation (React Class) or Widget name (string) */
  widget: string;

  /** If set to true, output widget will be borderless (usually applied to IfCondition, SwitchCondition) */
  nowrap?: boolean;

  [propKey: string]: UIWidgetProp;
}

export type WidgetComponent<T extends WidgetContainerProps> = FC<T> | ComponentClass<T, any>;

export type WidgetEventHandler = (eventName: string, eventData?: any) => void;

export interface WidgetContainerProps {
  id: string;
  data: BaseSchema;
  onEvent: WidgetEventHandler;
  [propKey: string]: any;
}

export type UIWidgetProp = Value | PropGenerator | VisualWidget;
type Value = string | number | boolean | undefined | { [key: string]: any };
type PropGenerator = (data: any) => string | number | object | JSX.Element;
