// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import get from 'lodash/get';

import { NodeEventTypes } from '../constants/NodeEventTypes';
import { EdgeMenuComponent, NodeMenuComponent, NodeWrapperComponent } from '../models/FlowRenderer.types';

import { RuleEditor } from './RuleEditor';

export interface AdaptiveDialogEditorProps {
  /** Dialog ID */
  dialogId: string;

  /** Dialog JSON */
  dialogData: any;

  /** Current active trigger path such as 'triggers[0]' */
  activeTrigger: string;

  /** Editor event handler */
  onEvent: (eventName: NodeEventTypes, eventData: any) => any;

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
}): JSX.Element | null => {
  const activeTriggerData = get(dialogData, activeTrigger, null);

  if (!activeTriggerData) return null;
  return (
    <RuleEditor key={`${dialogId}/${activeTrigger}`} id={activeTrigger} data={activeTriggerData} onEvent={onEvent} />
  );
};

AdaptiveDialogEditor.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
