/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../constants/ObiTypes';
import {
  DefaultRenderer,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  IfCondition,
  SwitchCondition,
  ActivityRenderer,
  Foreach,
  ChoiceInput,
} from '../nodes/index';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
  [ObiTypes.ChoiceInput]: ChoiceInput,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderFocusedStyle = css`
  outline: 1px solid #323130;
`;

const nodeBorderSelectedStyle = css`
  outline: 1px solid #0078d4;
`;

export const StepRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const { getNodeIndex, selectedIds } = useContext(SelectionContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeSelected = selectedIds.includes(id);

  return (
    <div
      className={classnames(
        'step-renderer-container',
        { 'step-renderer-container--focused': nodeFocused },
        { 'step-renderer-container--selected': nodeSelected }
      )}
      css={css`
        display: inline-block;
        position: relative;
        ${nodeFocused && nodeBorderFocusedStyle};
        ${nodeSelected && nodeBorderSelectedStyle};
        &:hover {
          ${nodeBorderFocusedStyle}
        }
      `}
      data-is-focusable={true}
      data-selection-index={getNodeIndex(id)}
    >
      <ChosenRenderer
        id={id}
        data={data}
        focused={nodeFocused}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'node');
        }}
      />
    </div>
  );
};

StepRenderer.defaultProps = defaultNodeProps;
