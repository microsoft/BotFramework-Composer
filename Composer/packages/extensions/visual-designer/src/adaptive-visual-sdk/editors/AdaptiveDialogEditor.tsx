// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import get from 'lodash/get';

import { EditorEventHandler } from '../constants/NodeEventTypes';
import {
  EdgeMenuComponent,
  NodeMenuComponent,
  NodeWrapperComponent,
} from '../../composer-flow-editor/types/FlowRenderer.types';
import { FlowRendererContext, DefaultFlowRenderers } from '../contexts/FlowRendererContext';

import { RuleEditor } from './RuleEditor';

export interface AdaptiveDialogEditorProps {
  /** Dialog ID */
  dialogId: string;

  /** Dialog JSON */
  dialogData: any;

  /** Current active trigger path such as 'triggers[0]' */
  activeTrigger: string;

  /** Editor event handler */
  onEvent: EditorEventHandler;

  /** Edge Menu renderer. Could be a fly-out '+' menu. */
  EdgeMenu?: EdgeMenuComponent;

  /** Node Menu renderer. Could be a fly-out '...' menu. */
  NodeMenu?: NodeMenuComponent;

  /** Element container renderer. Could be used to show the focus effect. */
  NodeWrapper?: NodeWrapperComponent;
}

export const AdaptiveDialogEditor: FC<AdaptiveDialogEditorProps> = ({
  dialogId,
  dialogData,
  activeTrigger,
  onEvent,
  EdgeMenu,
  NodeMenu,
  NodeWrapper,
}): JSX.Element => {
  const activeTriggerData = get(dialogData, activeTrigger, null);
  const content = activeTriggerData ? (
    <RuleEditor key={`${dialogId}/${activeTrigger}`} data={activeTriggerData} id={activeTrigger} onEvent={onEvent} />
  ) : null;

  return (
    <FlowRendererContext.Provider
      value={{
        EdgeMenu: EdgeMenu || DefaultFlowRenderers.EdgeMenu,
        NodeMenu: NodeMenu || DefaultFlowRenderers.NodeMenu,
        NodeWrapper: NodeWrapper || DefaultFlowRenderers.NodeWrapper,
      }}
    >
      {content}
    </FlowRendererContext.Provider>
  );
};

AdaptiveDialogEditor.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
