// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { SDKTypes } from '@bfc/shared';
import get from 'lodash/get';

import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { UISchemaRenderer } from '../../schema/uischemaRenderer';

import { ElementWrapper } from './ElementWrapper';

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

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent }): JSX.Element => {
  const $type = get(data, '$type', '');

  const content = <UISchemaRenderer id={id} data={data} onEvent={onEvent} />;

  if (TypesWithoutWrapper.some(x => $type === x)) {
    return content;
  }

  return (
    <ElementWrapper id={id} onEvent={onEvent}>
      {content}
    </ElementWrapper>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
