// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC, useContext } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { queryNode } from '../utils/jsonTracker';
import { EditorContext, EditorContextValue } from '../store/EditorContext';
import { StoreContext } from '../store/StoreContext';
import { StoreState } from '../store/store';
import { Collapse } from '../components/lib/Collapse';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { EditorProps, defaultEditorProps } from './editorProps';
import { EditorConfig } from './editorConfig';

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

const mapStoreToEditorContext = (store: StoreState): EditorContextValue => {
  const { eventPath, focusedId, focusedTab } = store;
  return {
    focusedEvent: eventPath,
    focusedId,
    focusedTab,
  };
};

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent, addCoachMarkRef }): JSX.Element | null => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { ruleGroup } = nodeMap;

  const { state } = useContext(StoreContext);
  const { eventPath } = state;

  const activeEventData = queryNode(data, eventPath);
  const eventActions = activeEventData ? (
    <RuleEditor
      key={eventPath}
      id={eventPath}
      data={activeEventData}
      onEvent={onEvent}
      addCoachMarkRef={addCoachMarkRef}
    />
  ) : null;

  if (!EditorConfig.features.showEvents) {
    return eventActions;
  }

  return (
    <EditorContext.Provider value={mapStoreToEditorContext(state)}>
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
        {ruleGroup && <EventsEditor key={ruleGroup.id} id={ruleGroup.id} data={ruleGroup.data} onEvent={onEvent} />}
        <div className="editor-interval" style={{ height: 50 }} />
        <Collapse text="Actions">{eventActions}</Collapse>
      </div>
    </EditorContext.Provider>
  );
};

AdaptiveDialogEditor.defaultProps = defaultEditorProps;
