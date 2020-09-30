// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { BaseSchema } from '@bfc/shared';
import { FlowEditorWidgetMap, FlowWidget, FlowWidgetProp, WidgetEventHandler } from '@bfc/extension-client';

import { Boundary } from '../../models/Boundary';
import { evaluateWidgetProp, ActionContextKey } from '../expression/widgetExpressionEvaluator';

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

export const renderUIWidget = (
  widgetSchema: FlowWidget,
  widgetMap: FlowEditorWidgetMap,
  context: UIWidgetContext
): JSX.Element => {
  const parseWidgetSchema = (widgetSchema: FlowWidget) => {
    const { widget, ...props } = widgetSchema;
    if (typeof widget === 'string') {
      const widgetName = widget;
      return {
        Widget: widgetMap[widgetName] || (() => <></>),
        props,
      };
    }
    return {
      Widget: widget,
      props,
    };
  };

  const buildWidgetProp = (rawPropValue: FlowWidgetProp, context: UIWidgetContext) => {
    // Case 1: For function props, invoke it to transform action data
    if (typeof rawPropValue === 'function') {
      const dataTransformer = rawPropValue;
      const element = dataTransformer(context.data);
      return element;
    }

    // Case 2: For string props, try evaluate it with Expression/LG engine
    if (typeof rawPropValue === 'string') {
      try {
        return evaluateWidgetProp(rawPropValue, { [ActionContextKey]: context.data }, ActionContextKey);
      } catch (err) {
        return rawPropValue;
      }
    }

    // Case 3: Recursive widget definition
    if (typeof rawPropValue === 'object' && rawPropValue.widget) {
      const widgetSchema = rawPropValue as FlowWidget;
      return renderUIWidget(widgetSchema, widgetMap, context);
    }

    return rawPropValue;
  };

  const { Widget, props: rawProps } = parseWidgetSchema(widgetSchema);
  const widgetProps = Object.keys(rawProps).reduce((props, propName) => {
    const propValue = rawProps[propName];
    props[propName] = buildWidgetProp(propValue, context);
    return props;
  }, {});

  return <Widget {...context} {...widgetProps} />;
};
