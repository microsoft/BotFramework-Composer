/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';
import { elementContainsAttribute } from '@uifabric/utilities';

import { ObiTypes } from '../../constants/ObiTypes';
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

const nodeBorderHoveredStyle = css`
  outline: 1px solid #323130;
`;

const nodeBorderSelectedStyle = css`
  outline: 1px solid #0078d4;
`;

const nodeBorderDoubleSelectedStyle = css`
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
        ${nodeSelected && !doubleSelected && nodeBorderSelectedStyle};
        ${nodeSelected && doubleSelected && nodeBorderDoubleSelectedStyle};
        ${nodeFocused && nodeBorderSelectedStyle};
        &:hover {
          ${!nodeFocused && !nodeSelected && nodeBorderHoveredStyle}
        }
      `}
      data-is-node={true}
      data-is-selectable={true}
      data-is-focusable={true}
      data-selected-id={selectedId}
      data-focused-id={id}
      data-selection-index={getNodeIndex(id)}
    >
      <ChosenRenderer
        id={id}
        data={data}
        onEvent={(action, id) => {
          onEvent(action, id, selectedId);
        }}
        onResize={size => {
          onResize(size, 'element');
        }}
      />
    </div>
  );
};

ElementRenderer.defaultProps = defaultNodeProps;
