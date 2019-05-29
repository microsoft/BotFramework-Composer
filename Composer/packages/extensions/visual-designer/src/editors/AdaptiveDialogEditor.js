import React, { useMemo } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../components/shared/GraphNode';
import { RecognizerGroup } from '../components/groups';
import { Panel } from '../components/nodes/templates/Panel';

import { StepEditor } from './StepEditor';

const calculateNodeMap = (_, data) => {
  const { recognizerGroup, ruleGroup, stepGroup } = transformRootDialog(data);
  return {
    dialog: GraphNode.fromIndexedJson(recognizerGroup),
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor = ({ id, data, focusedId, onEvent }) => {
  const { steps, rules } = data;
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { dialog, stepGroup, ruleGroup } = nodeMap;

  const recognizerPanelText = `Trigger(${dialog ? dialog.data.taskGroup.json.children.length : 0})`;
  const stepPanelText = `Steps(${steps ? steps.length : 0})`;
  const rulePanelText = `Rules(${rules ? rules.length : 0})`;

  return (
    <div
      style={{
        margin: 20,
        position: 'relative',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {dialog ? (
        <div>
          <Panel text={recognizerPanelText}>
            <RecognizerGroup
              key={dialog.id}
              id={dialog.id}
              data={dialog.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </Panel>
        </div>
      ) : null}
      {stepGroup ? (
        <div style={{ margin: '10px 0' }}>
          <Panel text={stepPanelText}>
            <StepEditor
              key={stepGroup.id}
              id={stepGroup.id}
              data={stepGroup.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </Panel>
        </div>
      ) : null}
      {ruleGroup ? (
        <div style={{ margin: '10px 0' }}>
          <Panel text={rulePanelText}>
            <StepEditor
              key={ruleGroup.id}
              id={ruleGroup.id}
              data={ruleGroup.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </Panel>
        </div>
      ) : null}
    </div>
  );
};

AdaptiveDialogEditor.propTypes = NodeProps;
AdaptiveDialogEditor.defaultProps = defaultNodeProps;
