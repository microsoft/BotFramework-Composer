// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { renderUIWidget } from '../../schema/flowSchemaRenderer';
import { FlowSchemaContext } from '../../store/FlowSchemaContext';

import { ElementWrapper } from './ElementWrapper';
import { ElementMeasurer } from './ElementMeasurer';

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const { widgets, schemaProvider } = useContext(FlowSchemaContext);

  const $kind = get(data, '$kind', '');
  const widgetSchema = schemaProvider.get($kind);

  const content = renderUIWidget(widgetSchema, widgets, { id, data, onEvent, onResize });
  if (widgetSchema.nowrap) {
    return content;
  }
  return (
    <ElementWrapper id={id} data={data} onEvent={onEvent}>
      <ElementMeasurer onResize={boundary => onResize(boundary)}>{content}</ElementMeasurer>
    </ElementWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
