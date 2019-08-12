/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../shared/ObiTypes';
import {
  DefaultRenderer,
  IntentRule,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  UnknownIntentRule,
  ConversationUpdateActivityRule,
  EventRule,
  IfCondition,
  SwitchCondition,
  ActivityRenderer,
  Foreach,
  ChoiceInput,
} from '../nodes/index';
import { NodeRendererContext } from '../../store/NodeRendererContext';

import { NodeProps, defaultNodeProps } from './sharedProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.EventRule]: EventRule,
  [ObiTypes.IfCondition]: IfCondition,
  [ObiTypes.IntentRule]: IntentRule,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.SwitchCondition]: SwitchCondition,
  [ObiTypes.UnknownIntentRule]: UnknownIntentRule,
  [ObiTypes.ConversationUpdateActivityRule]: ConversationUpdateActivityRule,
  [ObiTypes.Foreach]: Foreach,
  [ObiTypes.ForeachPage]: Foreach,
  [ObiTypes.ChoiceInput]: ChoiceInput,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderStyle = css`
  outline: 2px solid grey;
`;

export const NodeRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);

  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const nodeFocused = focusedId === id || focusedEvent === id;

  return (
    <div
      className={classnames('node-renderer-container', { 'node-renderer-container--focused': nodeFocused })}
      css={css`
        display: inline-block;
        position: relative;
        ${nodeFocused && nodeBorderStyle}
      `}
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

NodeRenderer.defaultProps = defaultNodeProps;
