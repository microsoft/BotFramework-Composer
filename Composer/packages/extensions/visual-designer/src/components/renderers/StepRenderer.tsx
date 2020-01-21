// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, ComponentClass } from 'react';
import { SDKTypes } from '@bfc/shared';
import get from 'lodash/get';

import { ObiTypes } from '../../constants/ObiTypes';
import { IfCondition, SwitchCondition, Foreach } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';
import { UISchemaRenderer } from '../../schema/uischemaRenderer';

import { ElementWrapper } from './ElementWrapper';

const rendererByObiType = {
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
};
const DEFAULT_RENDERER = UISchemaRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

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
  const $type = get(data, '$type', '');

  const ChosenRenderer = chooseRendererByType($type);
  const content = (
    <ChosenRenderer
      id={id}
      data={data}
      onEvent={onEvent}
      onResize={size => {
        onResize(size, 'node');
      }}
    />
  );

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
