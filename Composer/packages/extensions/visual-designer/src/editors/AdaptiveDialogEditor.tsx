// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC, useContext } from 'react';
import { DialogUtils } from '@bfc/shared';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { Collapse } from '../components/lib/Collapse';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { EditorProps, defaultEditorProps } from './editorProps';
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

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent, addCoachMarkRef }): JSX.Element | null => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { ruleGroup } = nodeMap;

  const { focusedEvent } = useContext(NodeRendererContext);

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

  const activeEventData = queryNode(data, focusedEvent);

  const eventActions = activeEventData ? (
    <RuleEditor
      key={focusedEvent}
      id={focusedEvent}
      data={activeEventData}
      onEvent={onEvent}
      addCoachMarkRef={addCoachMarkRef}
    />
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

AdaptiveDialogEditor.defaultProps = defaultEditorProps;
