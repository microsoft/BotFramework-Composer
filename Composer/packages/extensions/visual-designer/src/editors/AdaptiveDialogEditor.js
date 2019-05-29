import React, { useMemo } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../components/shared/GraphNode';
import { RecognizerGroup } from '../components/groups';
import { FoldNode } from '../components/nodes/templates/Fold';

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

  const recognizerFoldText = `Trigger(${dialog ? dialog.data.taskGroup.json.children.length : 0})`;
  const stepFoldText = `Steps(${steps ? steps.length : 0})`;
  const ruleFoldText = `Rules(${rules ? rules.length : 0})`;
  let recognizerGroupElement = null;
  let stepGroupElement = null;
  let ruleGroupElement = null;

  const foldGroup = (isFold, group) => {
    let groupElement = null;

    switch (group) {
      case 'rule':
        groupElement = ruleGroupElement;
        break;
      case 'step':
        groupElement = stepGroupElement;
        break;
      default:
        groupElement = recognizerGroupElement;
        break;
    }

    if (!groupElement) return;

    if (isFold) {
      groupElement.style.display = 'none';
    } else {
      groupElement.style.display = 'block';
    }
  };

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
          <FoldNode text={recognizerFoldText} onFold={isFold => foldGroup(isFold, 'recognizer')} />
          <div ref={el => (recognizerGroupElement = el)}>
            <RecognizerGroup
              key={dialog.id}
              id={dialog.id}
              data={dialog.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </div>
        </div>
      ) : null}
      {stepGroup ? (
        <div style={{ margin: '10px 0' }}>
          <FoldNode text={stepFoldText} onFold={isFold => foldGroup(isFold, 'step')} />
          <div ref={el => (stepGroupElement = el)}>
            <StepEditor
              key={stepGroup.id}
              id={stepGroup.id}
              data={stepGroup.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </div>
        </div>
      ) : null}
      {ruleGroup ? (
        <div style={{ margin: '10px 0' }}>
          <FoldNode text={ruleFoldText} onFold={isFold => foldGroup(isFold, 'rule')} />
          <div ref={el => (ruleGroupElement = el)}>
            <StepEditor
              key={ruleGroup.id}
              id={ruleGroup.id}
              data={ruleGroup.data}
              focusedId={focusedId}
              onEvent={onEvent}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

AdaptiveDialogEditor.propTypes = NodeProps;
AdaptiveDialogEditor.defaultProps = defaultNodeProps;
