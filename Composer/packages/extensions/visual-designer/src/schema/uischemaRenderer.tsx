// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import { BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { uiSchema } from './uischema';
import { UIWidget, UI_WIDGET_KEY, UIWidgetProp, WidgetEventHandler } from './uischema.types';

const parseWidgetSchema = (widgetSchema: UIWidget) => {
  const { [UI_WIDGET_KEY]: Widget, ...props } = widgetSchema;
  return {
    Widget,
    props,
  };
};

const buildWidgetProp = (rawPropValue: UIWidgetProp, context: UISchemaContext) => {
  if (typeof rawPropValue === 'function') {
    const dataTransformer = rawPropValue;
    const element = dataTransformer(context.data);
    return element;
  }

  if (typeof rawPropValue === 'object' && rawPropValue[UI_WIDGET_KEY]) {
    const widgetSchema = rawPropValue as UIWidget;
    return renderUISchema(widgetSchema, context);
  }

  return rawPropValue;
};

const renderUISchema = (schema: UIWidget, context: UISchemaContext): JSX.Element => {
  const { Widget, props: rawProps } = parseWidgetSchema(schema);
  const widgetProps = Object.keys(rawProps).reduce((props, propName) => {
    const propValue = rawProps[propName];
    props[propName] = buildWidgetProp(propValue, context);
    return props;
  }, {});

  return <Widget {...context} {...widgetProps} />;
};

export interface UISchemaContext {
  /** The uniq id of current schema data. Usually a json path. */
  id: string;

  /** Declarative json with a $type field. */
  data: BaseSchema;

  /** Handle UI events */
  onEvent: WidgetEventHandler;
}

export const UISchemaRenderer: FC<UISchemaContext> = (props): JSX.Element => {
  const $type = get(props.data, '$type');
  const schema = get(uiSchema, $type, uiSchema.default);
  return renderUISchema(schema, props);
};
