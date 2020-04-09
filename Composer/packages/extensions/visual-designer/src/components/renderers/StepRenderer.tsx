// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { renderUIWidget } from '../../schema/visualSchemaRenderer';
import { VisualSchemaContext } from '../../store/VisualSchemaContext';

import { ElementWrapper } from './ElementWrapper';
import { ElementMeasurer } from './ElementMeasurer';

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const schemaProvider = useContext(VisualSchemaContext);

  const $kind = get(data, '$kind', '');
  const widgetSchema = schemaProvider.get($kind);

  const content = renderUIWidget(widgetSchema, { id, data, onEvent, onResize });
  if (widgetSchema.nowrap) {
    return content;
  }
  return (
    <ElementWrapper id={id} onEvent={onEvent}>
      <ElementMeasurer onResize={boundary => onResize(boundary)}>{content}</ElementMeasurer>
    </ElementWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
