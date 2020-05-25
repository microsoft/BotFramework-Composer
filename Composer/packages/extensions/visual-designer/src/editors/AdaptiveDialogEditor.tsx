// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC } from 'react';
import { DialogUtils } from '@bfc/shared';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { Collapse } from '../components/lib/Collapse';
import { EdgeMenuComponent, NodeMenuComponent, NodeWrapperComponent } from '../models/FlowRenderer.types';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { EditorConfig } from './editorConfig';

const { queryNode } = DialogUtils;

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

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
  EdgeMenu,
  NodeMenu,
  NodeWrapper,
}): JSX.Element | null => {
  const nodeMap = useMemo(() => calculateNodeMap(dialogId, dialogData), [dialogId, dialogData]);
  const { ruleGroup } = nodeMap;

  const interceptRuleEvent = (eventName: NodeEventTypes, eventData: any) => {
    if (eventName === NodeEventTypes.Expand) {
      const selectedRulePath = eventData;
      return onEvent(NodeEventTypes.FocusEvent, selectedRulePath);
    }
    if (eventName === NodeEventTypes.Insert) {
      return onEvent(NodeEventTypes.InsertEvent, eventData);
    }
    return onEvent(eventName, eventData);
  };

  const activeEventData = queryNode(dialogData, activeTrigger);

  const eventActions = activeEventData ? (
    <RuleEditor key={activeTrigger} id={activeTrigger} data={activeEventData} onEvent={onEvent} />
  ) : null;

  if (!EditorConfig.features.showEvents) {
    return eventActions;
  }

  return (
    <div
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      {ruleGroup && (
        <EventsEditor key={ruleGroup.id} id={ruleGroup.id} data={ruleGroup.data} onEvent={interceptRuleEvent} />
      )}
      <div className="editor-interval" style={{ height: 50 }} />
      <Collapse text="Actions">{eventActions}</Collapse>
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = {
  dialogId: '',
  dialogData: {},
  onEvent: () => null,
};
