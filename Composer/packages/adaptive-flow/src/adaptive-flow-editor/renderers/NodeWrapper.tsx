// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext, useCallback, useEffect } from 'react';
import { generateActionTitle, PromptTab } from '@bfc/shared';
import { useShellApi } from '@bfc/extension-client';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultEffects } from 'office-ui-fabric-react/lib/Styling';

import { AttrNames } from '../constants/ElementAttributes';
import { NodeRendererContext } from '../contexts/NodeRendererContext';
import { SelectionContext } from '../contexts/SelectionContext';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';

// const nodeBorderHoveredStyle = css`
//   box-shadow: 0px 0px 0px 1px #323130;
// `;

const nodeBorderSelectedStyle = css`
  // box-shadow: 0px 0px 0px 2px #0078d4;
  box-shadow: ${DefaultEffects.elevation64};
`;

// BotAsks, UserAnswers and InvalidPromptBrick nodes selected style
// const nodeBorderDoubleSelectedStyle = css`
//   box-shadow: 0px 0px 0px 2px #0078d4, 0px 0px 0px 6px rgba(0, 120, 212, 0.3);
// `;

/**
 * When comments are visible, the tooltip target is invisible.
 */
const tooltipTargetStyle = (showComments = true) => css`
  position: absolute;
  right: ${showComments ? 0 : '-32px'};
  top: 0;
  height: 24px;
  width: 24px;
  background-color: #fff4ce;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 2px;

  display: flex;
  visibility: ${showComments ? 'hidden' : 'visible'};
  align-items: center;
  justify-content: center;
`;

const escapeId = (id: string) => {
  const charsToEscape = /(\[|\]|\.)/g;
  return id.replace(charsToEscape, '\\$1');
};

export type NodeWrapperProps = React.PropsWithChildren<{
  id: string;
  tab?: PromptTab;
  data: any;
  onEvent: (eventName: NodeEventTypes, eventData: any) => any;
  hideComment?: boolean;
}>;

export const ActionNodeWrapper = ({ id, tab, data, onEvent, hideComment, children }: NodeWrapperProps): JSX.Element => {
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
    flowCommentsVisible,
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

  // Set 'user-select' to none to disable browser's default
  // text selection effect when pressing Shift + Click.
  const content = (
    <div
      ref={actionRef}
      css={css`
        user-select: none;
        position: relative;
        border-radius: 2px 2px 0 0;
        ${(nodeSelected || nodeFocused) && nodeBorderSelectedStyle};
        &:focus {
          outline: 0;
        }
      `}
      data-testid="ActionNodeWrapper"
      id={nodeId}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
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

  return content;

  return !hideComment && data.$designer?.comment ? (
    <TooltipHost
      calloutProps={{
        directionalHint: DirectionalHint.rightTopEdge,
        gapSpace: 4,
        beakWidth: 12,
        target: escapeId(`#${nodeId}-comment-target`),
        styles: {
          container: { borderRadius: '2px' },
          calloutMain: { overflowWrap: 'break-word', whiteSpace: 'pre-line' },
        },
      }}
      content={data.$designer?.comment}
    >
      <div css={css({ position: 'relative' })}>
        <div css={tooltipTargetStyle(flowCommentsVisible)} id={`${nodeId}-comment-target`}>
          <Icon iconName="QuickNote" />
        </div>
        {content}
      </div>
    </TooltipHost>
  ) : (
    content
  );
};
