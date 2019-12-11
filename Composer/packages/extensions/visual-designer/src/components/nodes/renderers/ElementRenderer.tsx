// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, ComponentClass, useContext } from 'react';
import classnames from 'classnames';

import { ObiTypes } from '../../../constants/ObiTypes';
import { AttrNames } from '../../../constants/ElementAttributes';
import { EditorContext } from '../../../store/EditorContext';
import {
  DefaultRenderer,
  BeginDialog,
  ReplaceDialog,
  ActivityRenderer,
  ChoiceInput,
  BotAsks,
  UserInput,
  InvalidPromptBrick,
} from '../index';
import { NodeProps, defaultNodeProps } from '../types/nodeProps';

const rendererByObiType = {
  [ObiTypes.BeginDialog]: BeginDialog,
  [ObiTypes.ConditionNode]: DefaultRenderer,
  [ObiTypes.ReplaceDialog]: ReplaceDialog,
  [ObiTypes.SendActivity]: ActivityRenderer,
  [ObiTypes.ChoiceInputDetail]: ChoiceInput,
  [ObiTypes.BotAsks]: BotAsks,
  [ObiTypes.UserAnswers]: UserInput,
  [ObiTypes.InvalidPromptBrick]: InvalidPromptBrick,
};
const DEFAULT_RENDERER = DefaultRenderer;

function chooseRendererByType($type): FC<NodeProps> | ComponentClass<NodeProps> {
  const renderer = rendererByObiType[$type] || DEFAULT_RENDERER;
  return renderer;
}

const nodeBorderHoveredStyle = css`
  box-shadow: 0px 0px 0px 1px #323130;
`;

const nodeBorderSelectedStyle = css`
  box-shadow: 0px 0px 0px 2px #0078d4;
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
const nodeBorderDoubleSelectedStyle = css`
  outline: 2px solid #0078d4;
  box-shadow: 0px 0px 0px 6px rgba(0, 120, 212, 0.3);
`;

export interface ElementRendererProps extends NodeProps {
  tab?: string;
}

export const ElementRenderer: FC<ElementRendererProps> = ({ id, data, tab, onEvent, onResize }): JSX.Element => {
  const ChosenRenderer = chooseRendererByType(data.$type);
  const selectableId = tab ? `${id}${tab}` : id;
  const { focusedId, focusedEvent, focusedTab, selectedIds, getNodeIndex } = useContext(EditorContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeDoubleSelected = tab && nodeFocused && tab === focusedTab;
  const nodeSelected = selectedIds.includes(id);

  const declareElementAttributes = (selectedId: string, id: string) => {
    return {
      [AttrNames.NodeElement]: true,
      [AttrNames.FocusableElement]: true,
      [AttrNames.FocusedId]: id,
      [AttrNames.SelectableElement]: true,
      [AttrNames.SelectedId]: selectedId,
      [AttrNames.SelectionIndex]: getNodeIndex(id),
      [AttrNames.Tab]: tab,
    };
  };

  return (
    <div
      className={classnames('step-renderer-container', { 'step-renderer-container--focused': nodeFocused })}
      css={css`
        position: relative;
        border-radius: 2px 2px 0 0;
        display: inline-block;
        ${nodeSelected && nodeBorderSelectedStyle};
        ${nodeFocused && nodeBorderSelectedStyle};
        ${nodeDoubleSelected && nodeBorderDoubleSelectedStyle};
        &:hover {
          ${!nodeFocused && nodeBorderHoveredStyle}
        }
      `}
      {...declareElementAttributes(selectableId, id)}
    >
      <ChosenRenderer id={id} data={data} onEvent={onEvent} onResize={onResize} />
    </div>
  );
};

ElementRenderer.defaultProps = defaultNodeProps;
