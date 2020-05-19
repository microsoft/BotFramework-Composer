// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, useContext, ReactNode, ReactElement } from 'react';
import classnames from 'classnames';
import { generateSDKTitle } from '@bfc/shared';

import { AttrNames } from '../../constants/ElementAttributes';
import { NodeRendererContext } from '../../store/NodeRendererContext';
import { SelectionContext } from '../../store/SelectionContext';
import { NodeEventTypes } from '../../constants/NodeEventTypes';

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
export interface ElementWrapperProps {
  id: string;
  tab?: string;
  titleInHeader?: boolean;
  onEvent: (eventName: NodeEventTypes, eventData: any) => any;
}

function checkHasProps(node: ReactNode): node is ReactElement {
  return (node as ReactElement).props != null;
}

function extractNodeTitle(node: ReactNode, titleInHeader: boolean): string {
  if (node == null || typeof node !== 'object') {
    return '';
  }
  if (checkHasProps(node)) {
    const { props } = node;
    if (props?.header != null && titleInHeader) {
      return props?.header?.props?.title || '';
    } else if (props?.data != null) {
      return generateSDKTitle(props.data);
    } else if (props?.children != null) {
      return extractNodeTitle(props.children, titleInHeader);
    } else {
      return '';
    }
  }
  return '';
}

export const ElementWrapper: FC<ElementWrapperProps> = ({ id, tab, titleInHeader, onEvent, children }): JSX.Element => {
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

  const ariaLabel = extractNodeTitle(children, titleInHeader ?? false);

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
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id, tab });
      }}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
