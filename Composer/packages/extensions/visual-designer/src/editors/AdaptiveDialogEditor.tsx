// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, FC } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { queryNode } from '../utils/jsonTracker';
import { EditorContext } from '../store/EditorContext';
import { Collapse } from '../components/lib/Collapse';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { EditorConfig } from './editorConfig';

export interface AdaptiveDialogEditorProps {
  dialogId: string;
  dialogData: any;
  focusedEvent: string;
  focusedAction: string;
  focusedTab: string;
  selectedIds: string[];
  generateTabIndex?: (nodeId: string) => number;
  onEvent?: (eventName: NodeEventTypes, eventData?: any) => any;
}

const mapPropsToEditorContext = (props: AdaptiveDialogEditorProps) => {
  const { focusedEvent, focusedAction, focusedTab, selectedIds } = props;
  return {
    focusedEvent,
    focusedId: focusedAction,
    focusedTab,
    selectedIds,
  };
};

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor: FC<AdaptiveDialogEditorProps> = (props): JSX.Element | null => {
  const { dialogId, dialogData, focusedEvent: eventPath } = props;
  const onEvent = props.onEvent || (() => {});

  const { ruleGroup } = useMemo(() => calculateNodeMap(dialogId, dialogData), [dialogId, dialogData]);

  const EventDetails = () => {
    const activeEventData = queryNode(dialogData, eventPath);
    if (activeEventData) {
      return <RuleEditor key={eventPath} id={eventPath} data={activeEventData} onEvent={onEvent} />;
    }
    return null;
  };

  if (!EditorConfig.features.showEvents) {
    return <EventDetails />;
  }
  return (
    <EditorContext.Provider
      value={{
        ...mapPropsToEditorContext(props),
        getNodeIndex: props.generateTabIndex || (() => 0),
      }}
    >
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
        <Collapse text="Actions">
          <EventDetails />
        </Collapse>
      </div>
    </EditorContext.Provider>
  );
};

AdaptiveDialogEditor.defaultProps = {
  onEvent: () => {},
};
