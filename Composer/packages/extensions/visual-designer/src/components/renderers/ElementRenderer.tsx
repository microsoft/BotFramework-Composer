/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../constants/ObiTypes';
import { AttrNames } from '../../constants/ElementAttributes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import {
  DefaultRenderer,
  Recognizer,
  BeginDialog,
  ReplaceDialog,
  ActivityRenderer,
  ChoiceInput,
  BotAsks,
  UserAnswers,
  InvalidPromptBrick,
} from '../nodes/index';
import { NodeProps, defaultNodeProps } from '../nodes/nodeProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.LuisRecognizer]: Recognizer,
  [ObiTypes.RegexRecognizer]: Recognizer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.ChoiceInputDetail]: ChoiceInput,
  [ObiTypes.BotAsks]: BotAsks,
  [ObiTypes.UserAnswers]: UserAnswers,
  [ObiTypes.InvalidPromptBrick]: InvalidPromptBrick,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

// Node hover style
const nodeBorderHoveredStyle = css`
  box-shadow: 0px 0px 0px 1px #323130;
`;

// Other nodes selected style except botAsks, UserAnswers and InvalidPromptBrick
const nodeBorderSelectedStyle = css`
  box-shadow: 0px 0px 0px 2px #0078d4;
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes focused style
const nodeBorderDoubleFocusedStyle = css`
  outline: 2px solid #0078d4;
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
const nodeBorderDoubleSelectedStyle = css`
  outline: 2px solid #0078d4;
  border-radius: 0px;
  box-shadow: 0px 0px 0px 6px rgba(0, 120, 212, 0.3);
`;
export const ElementRenderer: FC<NodeProps> = ({ id, data, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);
  let elementType = '';
  let doubleSelected = false;
  switch (data.$type) {
    case ObiTypes.BotAsks:
    case ObiTypes.UserAnswers:
    case ObiTypes.InvalidPromptBrick:
      elementType = data.$type;
      doubleSelected = true;
      break;
    default:
      elementType = '';
      doubleSelected = false;
      break;
  }
  const selectedId = `${id}${elementType}`;
  const { focusedId, focusedEvent } = useContext(NodeRendererContext);
  const { getNodeIndex, selectedIds } = useContext(SelectionContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeSelected = selectedIds.includes(selectedId);

  const declareElementAttributes = (selectedId: string, id: string) => {
    return {
      [AttrNames.SelectableElement]: true,
      [AttrNames.NodeElement]: true,
      [AttrNames.FocusedId]: id,
      [AttrNames.SelectedId]: selectedId,
      [AttrNames.FocusableElement]: true,
      [AttrNames.SelectionIndex]: getNodeIndex(id),
    };
  };

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
        border-radius: 1px 1px 0 0;
        ${nodeSelected && !doubleSelected && nodeBorderSelectedStyle};
        ${nodeFocused && !doubleSelected && nodeBorderSelectedStyle};
        ${nodeFocused && doubleSelected && nodeBorderDoubleFocusedStyle};
        ${nodeSelected && doubleSelected && nodeBorderDoubleSelectedStyle};
        &:hover {
          ${!nodeFocused && !nodeSelected && nodeBorderHoveredStyle}
        }
      `}
      {...declareElementAttributes(selectedId, id)}
    >
      <ChosenRenderer
        id={id}
        data={data}
        onEvent={onEvent}
        onResize={size => {
          onResize(size, 'element');
        }}
      />
    </div>
  );
};

ElementRenderer.defaultProps = defaultNodeProps;
