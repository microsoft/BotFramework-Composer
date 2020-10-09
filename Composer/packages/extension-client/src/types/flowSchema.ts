// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, ComponentClass } from 'react';
import { BaseSchema, SDKKinds } from '@bfc/types';

export type FlowEditorWidgetMap = { [widgetName: string]: WidgetComponent<any> };
export enum FlowSchemaBuiltinKeys {
  default = 'default',
  custom = 'custom',
}

export interface FlowWidget {
  /** Widget implementation (React Class) or Widget name (string) */
  widget: string | WidgetComponent<any>;

  /** If set to true, output widget will be borderless (usually applied to IfCondition, SwitchCondition) */
  nowrap?: boolean;

  [propKey: string]: FlowWidgetProp;
}

export type WidgetComponent<T extends WidgetContainerProps> = FC<T> | ComponentClass<T, any>;

export type WidgetEventHandler = (eventName: string, eventData?: any) => void;

export interface WidgetContainerProps {
  id: string;
  data: BaseSchema;
  onEvent: WidgetEventHandler;
  [propKey: string]: any;
}

export type FlowWidgetProp = Value | PropGenerator | FlowWidget;
type Value = string | number | boolean | undefined | { [key: string]: any };
type PropGenerator = (data: any) => string | number | object | JSX.Element;

export type FlowUISchema = {
  [key in SDKKinds | FlowSchemaBuiltinKeys]?: FlowWidget;
};
