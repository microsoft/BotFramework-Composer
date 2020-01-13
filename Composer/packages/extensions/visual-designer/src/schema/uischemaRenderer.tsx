// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import { BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { uiSchema } from './uischema';
import { UIWidget, UI_WIDGET_KEY, UIWidgetProp, WidgetEventHandler } from './uischema.types';

const buildWidgetProp = (data: BaseSchema, rawPropValue: UIWidgetProp) => {
  if (typeof rawPropValue === 'function') {
    const dataTransformer = rawPropValue;
    const element = dataTransformer(data);
    return element;
  }

  return rawPropValue;
};

const buildWidgetProps = (data: BaseSchema, rawProps) => {
  return Object.keys(rawProps).reduce((props, propName) => {
    const propValue = rawProps[propName];
    props[propName] = buildWidgetProp(data, propValue);
    return props;
  }, {});
};

const parseWidgetSchema = (data: BaseSchema, widgetSchema: UIWidget) => {
  const { [UI_WIDGET_KEY]: Widget, ...rawProps } = widgetSchema;
  const props = buildWidgetProps(data, rawProps);
  return {
    Widget,
    props,
  };
};

export interface UISchemaRendererProps {
  /** The uniq id of current schema data. Usually a json path. */
  id: string;

  /** Declarative json with a $type field. */
  data: BaseSchema;

  /** Handle UI events */
  onEvent: WidgetEventHandler;
}

export const UISchemaRenderer: FC<UISchemaRendererProps> = ({ id, data, onEvent, ...contextProps }): JSX.Element => {
  const $type = get(data, '$type');
  const schema = get(uiSchema, $type, uiSchema.default);
  const { Widget, props } = parseWidgetSchema(data, schema);
  return <Widget id={id} data={data} onEvent={onEvent} {...contextProps} {...props} />;
};
