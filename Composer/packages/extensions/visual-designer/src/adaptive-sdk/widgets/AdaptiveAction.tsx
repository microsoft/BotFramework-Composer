// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import get from 'lodash/get';

import { renderUIWidget } from '../../schema/flowSchemaRenderer';
import { FlowSchemaContext } from '../../store/FlowSchemaContext';
import { FlowRendererContext } from '../../store/FlowRendererContext';
import { ElementMeasurer } from '../lib/ElementMeasurer';

import { NodeProps, defaultNodeProps } from './types/NodeProps.types';

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const { widgets, schemaProvider } = useContext(FlowSchemaContext);
  const { NodeWrapper } = useContext(FlowRendererContext);

  const $kind = get(data, '$kind', '');
  const widgetSchema = schemaProvider.get($kind);

  const content = renderUIWidget(widgetSchema, widgets, { id, data, onEvent, onResize });
  if (widgetSchema.nowrap) {
    return content;
  }
  return (
    <NodeWrapper nodeId={id} nodeData={data} onEvent={onEvent}>
      <ElementMeasurer onResize={boundary => onResize(boundary)}>{content}</ElementMeasurer>
    </NodeWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
