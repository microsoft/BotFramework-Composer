// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FC, ComponentClass } from 'react';
import { BaseSchema, SDKTypes } from '@bfc/shared';

/** schema */
export type UISchema = {
  [key in SDKTypes]?: UIWidget;
};

/** widget */
export const UI_WIDGET_KEY = 'ui:widget';

export interface UIWidget {
  [UI_WIDGET_KEY]: WidgetComponent<any>;
  [propKey: string]: UIWidgetProp;
}

export type WidgetComponent<T extends WidgetContainerProps> = FC<T> | ComponentClass<T, any>;

export interface WidgetContainerProps {
  data: BaseSchema;
  [propKey: string]: any;
}

export type UIWidgetProp = Value | PropGenerator;
type Value = string | number | { [key: string]: any };
type PropGenerator = (data: any) => string | number | object | JSX.Element;
