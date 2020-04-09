// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { BaseSchema } from '@bfc/shared';
import { VisualWidget, UIWidgetProp, WidgetEventHandler } from '@bfc/extension';

import { Boundary } from '../models/Boundary';
import * as BuiltInWidgets from '../widgets';

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
  const { widget, ...props } = widgetSchema;
  if (typeof widget === 'string') {
    const widgetName = widget;
    return {
      Widget: BuiltInWidgets[widgetName] || (() => <></>),
      props,
    };
  }
  return {
    Widget: widget,
    props,
  };
};

const buildWidgetProp = (rawPropValue: UIWidgetProp, context: UIWidgetContext) => {
  if (typeof rawPropValue === 'function') {
    const dataTransformer = rawPropValue;
    const element = dataTransformer(context.data);
    return element;
  }

  // handle recursive widget def
  if (typeof rawPropValue === 'object' && rawPropValue.widget) {
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
