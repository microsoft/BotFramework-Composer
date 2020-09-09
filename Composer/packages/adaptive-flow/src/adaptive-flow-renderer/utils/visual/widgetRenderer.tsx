// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { BaseSchema } from '@bfc/shared';
import { FlowEditorWidgetMap } from '@bfc/editor-extension';

import { FlowWidget, FlowWidgetProp, WidgetEventHandler } from '../../types/flowRenderer.types';
import { Boundary } from '../../models/Boundary';

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
    if (typeof rawPropValue === 'function') {
      const dataTransformer = rawPropValue;
      const element = dataTransformer(context.data);
      return element;
    }

    // handle recursive widget def
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
