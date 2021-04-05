// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, useContext, useCallback, useEffect } from 'react';
import { generateActionTitle, PromptTab } from '@bfc/shared';
import { useShellApi } from '@bfc/extension-client';

import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../contexts/NodeRendererContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';

const nodeBorderHoveredStyle = css`
  box-shadow: 0px 0px 0px 1px #323130;
`;

const nodeBorderSelectedStyle = css`
  box-shadow: 0px 0px 0px 2px #0078d4;
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
const nodeBorderDoubleSelectedStyle = css`
  box-shadow: 0px 0px 0px 2px #0078d4, 0px 0px 0px 6px rgba(0, 120, 212, 0.3);
`;
export interface NodeWrapperProps {
  id: string;
  tab?: PromptTab;
  data: any;
  onEvent: (eventName: NodeEventTypes, eventData: any) => any;
}

export const ActionNodeWrapper: FC<NodeWrapperProps> = ({ id, tab, data, onEvent, children }): JSX.Element => {
  const selectableId = tab ? `${id}${tab}` : id;
  const { focusedId, focusedEvent, focusedTab } = useContext(NodeRendererContext);
  const { selectedIds, getNodeIndex } = useContext(SelectionContext);
  const nodeFocused = focusedId === id || focusedEvent === id;
  const nodeDoubleSelected = tab && nodeFocused && tab === focusedTab;
  const nodeSelected = selectedIds.includes(id);
  const nodeId = `action-${selectableId}`;

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

  const {
    shellApi: { addCoachMarkRef },
  } = useShellApi();
  const actionRef = useCallback(
    (action) => {
      nodeFocused && addCoachMarkRef({ action });
    },
    [nodeFocused]
  );

  useEffect(() => {
    if (nodeSelected || nodeDoubleSelected) {
      const actionNode = document.getElementById(nodeId);
      actionNode?.focus();
    }
  }, [nodeSelected, tab, nodeDoubleSelected]);

  // Set 'use-select' to none to disable browser's default
  // text selection effect when pressing Shift + Click.
  return (
    <div
      ref={actionRef}
      css={css`
        user-select: none;
        position: relative;
        border-radius: 2px 2px 0 0;
        ${nodeSelected && nodeBorderSelectedStyle};
        ${nodeFocused && nodeBorderSelectedStyle};
        ${nodeDoubleSelected && nodeBorderDoubleSelectedStyle};
        &:hover {
          ${!nodeFocused && nodeBorderHoveredStyle}
        }
        &:focus {
          outline: 0;
        }
      `}
      data-testid="ActionNodeWrapper"
      id={nodeId}
      tabIndex={0}
      {...declareElementAttributes(selectableId, id)}
      aria-label={generateActionTitle(data, '', '', tab)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        const payload = { id, tab };
        if (e.ctrlKey || e.metaKey) {
          return onEvent(NodeEventTypes.CtrlClick, payload);
        }
        if (e.shiftKey) {
          return onEvent(NodeEventTypes.ShiftClick, payload);
        }
        onEvent(NodeEventTypes.Focus, payload);
      }}
    >
      {children}
    </div>
  );
};
