import React, { useMemo } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeClickActionTypes } from '../shared/NodeClickActionTypes';
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../components/shared/GraphNode';
import { RecognizerGroup, StepGroup } from '../components/groups';

const ColMargin = 10;

const calculateNodeMap = (_, data) => {
  const { recognizerGroup, ruleGroup, stepGroup } = transformRootDialog(data);
  return {
    dialog: GraphNode.fromIndexedJson(recognizerGroup),
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor = ({ id, data, focusedId, onEvent, nodeRefs, selectedNodes }) => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { dialog, stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        margin: 20,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeClickActionTypes.Focus, '');
      }}
    >
      {dialog ? (
        <div style={{ margin: ColMargin }}>
          <RecognizerGroup
            key={dialog.id}
            id={dialog.id}
            data={dialog.data}
            focusedId={focusedId}
            onEvent={onEvent}
            nodeRefs={nodeRefs}
            selectedNodes={selectedNodes}
          />
        </div>
      ) : null}
      {stepGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepGroup
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
            nodeRefs={nodeRefs}
            selectedNodes={selectedNodes}
          />
        </div>
      ) : null}
      {ruleGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepGroup
            key={ruleGroup.id}
            id={ruleGroup.id}
            data={ruleGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
            nodeRefs={nodeRefs}
            selectedNodes={selectedNodes}
          />
        </div>
      ) : null}
    </div>
  );
};

AdaptiveDialogEditor.propTypes = NodeProps;
AdaptiveDialogEditor.defaultProps = defaultNodeProps;
