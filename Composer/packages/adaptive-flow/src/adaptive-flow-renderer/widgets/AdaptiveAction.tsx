// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../types/nodeProps';
import { renderUIWidget } from '../utils/visual/widgetRenderer';
import { SchemaContext } from '../contexts/SchemaContext';
import { RendererContext } from '../contexts/RendererContext';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { buitinNowrapWidgetNames } from '../configs/buitinNowrapWidgetNames';
import { ActionContextKey, evaluateWidgetProp } from '../utils/expression/widgetExpressionEvaluator';

const parseNowrap = (nowrapVal: string | boolean | undefined, data: any): boolean => {
  if (typeof nowrapVal !== 'string') return !!nowrapVal;
  return evaluateWidgetProp(nowrapVal, { [ActionContextKey]: data }, ActionContextKey);
};

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const { widgets, schemaProvider, sdkschema } = useContext(SchemaContext);
  const { NodeWrapper } = useContext(RendererContext);

  const $kind = get(data, '$kind', '');
  const widgetSchema = schemaProvider.get($kind);
  const adaptiveSchema = get(sdkschema, $kind, {});

  const content = renderUIWidget(widgetSchema, widgets, { id, data, adaptiveSchema, onEvent, onResize });
  const nowrap = parseNowrap(widgetSchema.nowrap, data);
  if (nowrap || buitinNowrapWidgetNames.some((name) => name === widgetSchema.widget)) {
    return content;
  }

  return (
    <NodeWrapper nodeData={data} nodeId={id} onEvent={onEvent}>
      <ElementMeasurer onResize={(boundary) => onResize(boundary)}>{content}</ElementMeasurer>
    </NodeWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
