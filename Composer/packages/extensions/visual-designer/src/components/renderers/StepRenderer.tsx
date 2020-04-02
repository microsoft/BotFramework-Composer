// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, useContext } from 'react';
import { SDKKinds } from '@bfc/shared';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { renderUIWidget } from '../../schema/uischemaRenderer';
import { UISchemaContext } from '../../store/UISchemaContext';

import { ElementWrapper } from './ElementWrapper';
import { ElementMeasurer } from './ElementMeasurer';

/** TODO: (zeye) integrate this array into UISchema */
const TypesWithoutWrapper = [
  SDKKinds.IfCondition,
  SDKKinds.SwitchCondition,
  SDKKinds.Foreach,
  SDKKinds.ForeachPage,
  SDKKinds.AttachmentInput,
  SDKKinds.ConfirmInput,
  SDKKinds.DateTimeInput,
  SDKKinds.NumberInput,
  SDKKinds.TextInput,
  SDKKinds.ChoiceInput,
];

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const schemaProvider = useContext(UISchemaContext);

  const $kind = get(data, '$kind', '');
  const widgetSchema = schemaProvider.get($kind);

  const content = renderUIWidget(widgetSchema, { id, data, onEvent, onResize });
  if (TypesWithoutWrapper.some(x => $kind === x)) {
    return content;
  }
  return (
    <ElementWrapper id={id} onEvent={onEvent}>
      <ElementMeasurer onResize={boundary => onResize(boundary)}>{content}</ElementMeasurer>
    </ElementWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
