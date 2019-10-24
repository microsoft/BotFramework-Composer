/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, ComponentClass } from 'react';

import { ObiTypes } from '../../constants/ObiTypes';
import { IfCondition, SwitchCondition, Foreach, BaseInput } from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

import { ElementRenderer } from './ElementRenderer';

const rendererByObiType = {
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
  [ObiTypes.AttachmentInput]: BaseInput,
  [ObiTypes.ConfirmInput]: BaseInput,
  [ObiTypes.DateTimeInput]: BaseInput,
  [ObiTypes.NumberInput]: BaseInput,
  [ObiTypes.OAuthInput]: BaseInput,
  [ObiTypes.TextInput]: BaseInput,
  [ObiTypes.ChoiceInput]: BaseInput,
};
const DEFAULT_RENDERER = ElementRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  return (
    <ChosenRenderer
      id={id}
      data={data}
      onEvent={onEvent}
      onResize={size => {
        onResize(size, 'node');
      }}
    />
  );
};

StepRenderer.defaultProps = defaultNodeProps;
