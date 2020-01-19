// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, useContext } from 'react';
import classnames from 'classnames';

import { AttrNames } from '../../constants/ElementAttributes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';

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
export interface ElementWrapperProps {
  id: string;
  tab?: string;
}

export const ElementWrapper: FC<ElementWrapperProps> = ({ id, tab, children }): JSX.Element => {
  const selectableId = tab ? `${id}${tab}` : id;
  const { focusedId, focusedEvent, focusedTab } = useContext(NodeRendererContext);
  const { selectedIds, getNodeIndex } = useContext(SelectionContext);
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
        ${nodeSelected && nodeBorderSelectedStyle};
        ${nodeFocused && nodeBorderSelectedStyle};
        ${nodeDoubleSelected && nodeBorderDoubleSelectedStyle};
        &:hover {
          ${!nodeFocused && nodeBorderHoveredStyle}
        }
      `}
      {...declareElementAttributes(selectableId, id)}
    >
      {children}
    </div>
  );
};
