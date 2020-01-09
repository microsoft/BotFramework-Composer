// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { BaseSchema } from '@bfc/shared';
import get from 'lodash/get';

import { uiSchema } from './uischema';
import { UIWidget, UI_WIDGET_KEY, UIWidgetProp } from './uischema.types';

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

const renderWidget = (inputData, schema: UIWidget, contextProps = {}): JSX.Element => {
  const { Widget, props } = parseWidgetSchema(inputData, schema);
  return <Widget data={inputData} {...contextProps} {...props} />;
};

export const renderSDKType = (data: BaseSchema, context?: { menu: JSX.Element; onClick }): JSX.Element => {
  const $type = get(data, '$type');
  const schema = get(uiSchema, $type, uiSchema.default);

  return renderWidget(data, schema, context);
};
