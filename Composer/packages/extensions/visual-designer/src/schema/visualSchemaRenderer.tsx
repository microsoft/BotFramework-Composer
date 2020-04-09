// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { BaseSchema } from '@bfc/shared';

import { Boundary } from '../models/Boundary';
import * as BuiltInWidgets from '../widgets';

import { VisualWidget, UI_WIDGET_KEY, UIWidgetProp, WidgetEventHandler } from './visualSchema.types';

export interface UIWidgetContext {
  /** The uniq id of current schema data. Usually a json path. */
  id: string;

  /** Declarative json with a $kind field. */
  data: BaseSchema;

  /** Handle UI events */
  onEvent: WidgetEventHandler;

  /** Report widget boundary */
  onResize: (boundary: Boundary) => void;
}

const parseWidgetSchema = (widgetSchema: VisualWidget) => {
  const { [UI_WIDGET_KEY]: widgetValue, ...props } = widgetSchema;
  if (typeof widgetValue === 'string') {
    const widgetName = widgetValue;
    return {
      Widget: BuiltInWidgets[widgetName] || (() => <></>),
      props,
    };
  }
  return {
    Widget: widgetValue,
    props,
  };
};

const buildWidgetProp = (rawPropValue: UIWidgetProp, context: UIWidgetContext) => {
  if (typeof rawPropValue === 'function') {
    const dataTransformer = rawPropValue;
    const element = dataTransformer(context.data);
    return element;
  }

  if (typeof rawPropValue === 'object' && rawPropValue[UI_WIDGET_KEY]) {
    const widgetSchema = rawPropValue as VisualWidget;
    return renderUIWidget(widgetSchema, context);
  }

  return rawPropValue;
};

export const renderUIWidget = (widgetSchema: VisualWidget, context: UIWidgetContext): JSX.Element => {
  const { Widget, props: rawProps } = parseWidgetSchema(widgetSchema);
  const widgetProps = Object.keys(rawProps).reduce((props, propName) => {
    const propValue = rawProps[propName];
    props[propName] = buildWidgetProp(propValue, context);
    return props;
  }, {});

  return <Widget {...context} {...widgetProps} />;
};
