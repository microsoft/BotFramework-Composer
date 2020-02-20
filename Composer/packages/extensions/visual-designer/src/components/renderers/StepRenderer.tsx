// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import { SDKTypes } from '@bfc/shared';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { renderUIWidget } from '../../schema/uischemaRenderer';
import { UISchemaContext } from '../../store/UISchemaContext';

import { ElementWrapper } from './ElementWrapper';
import { ElementMeasurer } from './ElementMeasurer';

/** TODO: (zeye) integrate this array into UISchema */
const TypesWithoutWrapper = [
  SDKTypes.IfCondition,
  SDKTypes.SwitchCondition,
  SDKTypes.Foreach,
  SDKTypes.ForeachPage,
  SDKTypes.AttachmentInput,
  SDKTypes.ConfirmInput,
  SDKTypes.DateTimeInput,
  SDKTypes.NumberInput,
  SDKTypes.TextInput,
  SDKTypes.ChoiceInput,
];

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const schemaProvider = useContext(UISchemaContext);

  const $type = get(data, '$type', '');
  const widgetSchema = schemaProvider.get($type);

  const content = renderUIWidget(widgetSchema, { id, data, onEvent, onResize });
  if (TypesWithoutWrapper.some(x => $type === x)) {
    return content;
  }
  return (
    <ElementWrapper id={id} onEvent={onEvent}>
      <ElementMeasurer onResize={boundary => onResize(boundary)}>{content}</ElementMeasurer>
    </ElementWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
