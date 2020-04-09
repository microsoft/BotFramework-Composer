// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, ComponentClass } from 'react';
import { BaseSchema, SDKKinds } from '@bfc/shared';

import { NodeEventTypes } from '../constants/NodeEventTypes';

export enum UISchemaBuiltinKeys {
  default = 'default',
}

/** schema */
export type UISchema = {
  [key in SDKKinds | UISchemaBuiltinKeys]?: UIWidget;
};

/** widget */
export const UI_WIDGET_KEY = 'widget';

export interface UIWidget {
  [UI_WIDGET_KEY]: WidgetComponent<any> | string;
  [propKey: string]: UIWidgetProp;
}

export type WidgetComponent<T extends WidgetContainerProps> = FC<T> | ComponentClass<T, any>;

export type WidgetEventHandler = (eventName: NodeEventTypes, eventData?: any) => void;

export interface WidgetContainerProps {
  id: string;
  data: BaseSchema;
  onEvent: WidgetEventHandler;
  [propKey: string]: any;
}

export type UIWidgetProp = Value | PropGenerator | UIWidget;
type Value = string | number | { [key: string]: any };
type PropGenerator = (data: any) => string | number | object | JSX.Element;
