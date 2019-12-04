// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC, useContext, useRef, useEffect } from 'react';
import { MarqueeSelection, Selection } from 'office-ui-fabric-react/lib/MarqueeSelection';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { queryNode } from '../utils/jsonTracker';
import { NodeIndexGenerator } from '../utils/NodeIndexGetter';
import { EditorContext } from '../store/EditorContext';
import { StoreContext } from '../store/StoreContext';
import { StoreState } from '../store/store';
import { Collapse } from '../components/lib/Collapse';
import setFocusState from '../actions/setFocusState';
import setDragSelection from '../actions/setDragSelection';

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

const mapStoreToEditorContext = (store: StoreState) => {
  const { eventPath, focusedId, focusedTab, selectedIds } = store;
  return {
    focusedEvent: eventPath,
    focusedId,
    focusedTab,
    selectedIds,
  };
};

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent, addCoachMarkRef }): JSX.Element | null => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { ruleGroup } = nodeMap;

  const { state, dispatch } = useContext(StoreContext);
  const { eventPath } = state;

  const nodeIndexGenerator = useRef(new NodeIndexGenerator());
  const nodeItems = nodeIndexGenerator.current.getItemList();
  const activeEventData = queryNode(data, eventPath);

  useEffect(
    (): void => {
      selection.setItems(nodeIndexGenerator.current.getItemList());
    }
  );

  const selection = new Selection({
    onSelectionChanged: (): void => {
      const selectedIndices = selection.getSelectedIndices();
      const selectedIds = selectedIndices.map(index => nodeItems[index].key as string);

      if (selectedIds.length === 1) {
        dispatch(setFocusState(selectedIds[0]));
      }
      dispatch(setDragSelection(selectedIds));
    },
  });

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
    <EditorContext.Provider
      value={{
        ...mapStoreToEditorContext(state),
        getNodeIndex: (nodeId: string) => nodeIndexGenerator.current.getNodeIndex(nodeId),
      }}
    >
      <MarqueeSelection selection={selection} css={{ width: '100%', height: '100%' }}>
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
      </MarqueeSelection>
    </EditorContext.Provider>
  );
};

AdaptiveDialogEditor.defaultProps = defaultEditorProps;
